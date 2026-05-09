import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@src/app/base';
import { SuccessResponse } from '@src/app/types';
import { asyncForEach, calculateDiscount, generateCode } from '@src/shared';
import { isNotEmptyObject } from 'class-validator';
import { DataSource, FindOptionsRelations, In, Not, QueryRunner, Repository } from 'typeorm';
import { ENUM_INTERNAL_ORDER_STATUS } from '../../order/const';
import { OrderService } from '../../order/services/order.service';
import { ENUM_PRODUCT_TYPE } from '../const';
import { ProductCreateDTO } from '../dtos/product/create.dto';
import { ProductCategoryUpdateDTO, ProductGenreUpdateDTO, ProductMediaUpdateDTO, ProductUpdateDTO, ProductVariantUpdateDTO } from '../dtos/product/update.dto';
import { Product } from '../entities/product.entity';
import { ProductGenre } from '../entities/productGenres.entity';
import { ProductMedia } from '../entities/productMedia.entity';
import { ProductVariantOption } from '../entities/productVariantOption.entity';
import { ProductGenreService } from './productGenre.service';
import { ProductMediaService } from './productMedia.service';
import { ProductReviewService } from './productReview.service';
import { ProductVariantOptionService } from './productVariantOption.service';
import { ProductCategory } from '../entities/productCategories.entity';
import { ProductCategoryService } from './productCategory.service';
import { ENV } from '@src/env';

@Injectable()
export class ProductService extends BaseService<Product> {
  constructor(
    @InjectRepository(Product)
    private readonly _repo: Repository<Product>,
    private readonly dataSource: DataSource,
    private readonly productGenreService: ProductGenreService,
    private readonly productCategoryService: ProductCategoryService,
    private readonly productMediaService: ProductMediaService,
    private readonly productVariantOptionService: ProductVariantOptionService,
    @Inject(forwardRef(() => OrderService))
    private readonly orderService: OrderService,
    private readonly productReviewService: ProductReviewService,
  ) {
    super(_repo);
  }

  async createProduct(payload: ProductCreateDTO, relations?: FindOptionsRelations<Product>): Promise<Product> {
    const { tags, genres, categories, medias, hasVariant, variants, discountAmount = 0, stockQuantity = 0, discountType = 'flat', ...restPayload } = payload;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let createdProduct = null;

    try {
      if (discountAmount < 0) {
        throw new BadRequestException('Discount amount can not be less than 0!')
      }
      // let productDiscount = 0;
      let productStockQuantity = 0;
      const productDiscount = calculateDiscount(
        {
          discountType: discountType,
          amount: discountAmount
        },
        restPayload.mrp,
        'discountAmount'
      );
      // if (discountType === 'flat')
      //   productDiscount = discountAmount;
      // else {
      //   productDiscount = (restPayload.mrp * discountAmount) / 100;
      // }
      if (productDiscount > restPayload.mrp) throw new BadRequestException(`Discount amount can't be more than mrp!`)
      const pSaleAmount = Math.round(restPayload.mrp - productDiscount);
      const productCode = await this.generateUniqueCode(queryRunner);
      createdProduct = await queryRunner.manager.save(Product, {
        ...restPayload,
        stockQuantity,
        discountAmount,
        discountType,
        hasVariant,
        code: productCode,
        sku: restPayload?.sku ?? productCode,
        saleAmount: pSaleAmount,
        tags: payload?.tags?.length ? [...new Set(payload.tags)] : []
      }
      );

      if (!createdProduct) {
        throw new BadRequestException('Product not created');
      }
      if (hasVariant) {
        if (!variants || variants.length === 0) {
          throw new BadRequestException('Add at least one variant');
        }
        await asyncForEach(variants, async (variant) => {
          productStockQuantity = productStockQuantity + variant.stockQuantity;
          const variantDiscount = calculateDiscount(
            {
              discountType: discountType,
              amount: (discountAmount + variant.additionalDiscount)
            },
            (restPayload.mrp + variant.additionalMRP),
            'discountAmount'
          );
          const vSaleAmount = Math.round((restPayload.mrp + variant.additionalMRP) - variantDiscount)
          await queryRunner.manager.save(
            Object.assign(new ProductVariantOption(), {
              ...variant,
              saleAmount: vSaleAmount,
              productId: createdProduct.id,
            }),
          );
        });

        if (productStockQuantity > 0) {
          await queryRunner.manager.save(
            Object.assign(new Product(), {
              stockQuantity: productStockQuantity,
              id: createdProduct.id,
            }),
          );
        }

      }

      if (genres && genres.length > 0) {
        await asyncForEach(genres, async (genre) => {
          await queryRunner.manager.save(
            Object.assign(new ProductGenre(), {
              productId: createdProduct.id,
              genreId: genre.genreId,
            }),
          );
        });
      }

      if (categories && categories.length > 0) {
        await asyncForEach(categories, async (category) => {
          await queryRunner.manager.save(
            Object.assign(new ProductCategory(), {
              productId: createdProduct.id,
              categoryId: category.categoryId,
            }),
          );
        });
      }
      if (medias && medias.length > 0) {
        await asyncForEach(medias, async (media) => {
          await queryRunner.manager.save(
            Object.assign(new ProductMedia(), {
              productId: createdProduct.id,
              galleryId: media.galleryId,
            }),
          );
        });
      }
      await queryRunner.commitTransaction();
      return this.findOne({
        where: {
          id: createdProduct.id,
        },
        relations,
      });

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateProduct(
    id: string,
    payload: ProductUpdateDTO,
    relations: FindOptionsRelations<Product>,
  ): Promise<Product> {
    const product = await this.isExist({ id: id });

    const { tags, genres, categories, medias, variants, stockQuantity = 0, discountAmount = 0, ...restData } = payload;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (discountAmount < 0) {
        throw new BadRequestException('Discount amount can not be less than 0!')
      }
      let productStockQuantity = 0;
      // let productDiscount = 0;
      let pSaleAmount = 0;
      const productDiscount = calculateDiscount(
        {
          discountType: restData.discountType,
          amount: discountAmount
        },
        restData.mrp,
        'discountAmount'
      );
      // if (restData.discountType === "flat") {
      //   productDiscount = discountAmount;
      // } else if (restData.discountType === "percentage") {
      //   productDiscount = ((restData.mrp ?? 0) * (discountAmount ?? 0)) / 100;
      // }
      if (isNotEmptyObject(restData)) {
        // if (restData?.mrp && discountAmount && restData.discountType) {
        pSaleAmount = Math.round((restData.mrp ?? 0) - productDiscount);
        restData['saleAmount'] = pSaleAmount;
        // }
        if (pSaleAmount < 0)
          throw new BadRequestException('Discount exceeded the MRP!')
        const mergedTags = [...new Set([...(product.tags || []), ...(tags || [])])];
        await queryRunner.manager.save(Product, { ...restData, discountAmount, stockQuantity, tags: mergedTags, id });
      }
      if (variants && variants.length > 0) {
        const deletedItems = variants.filter((variant) => variant.isDeleted);
        const newOrUpdatedItems = variants.filter((variant) => !variant.isDeleted);

        if (deletedItems?.length) {
          await queryRunner.manager.delete(ProductVariantOption, deletedItems.map((pvo) => ({
            productId: id,
            variantId: pvo.variantId,
            variantOptionId: pvo.variantOptionId,
          })))
        }

        if (newOrUpdatedItems?.length) {
          await asyncForEach(newOrUpdatedItems, async (variant: ProductVariantUpdateDTO) => {
            const variantDiscount = calculateDiscount(
              {
                discountType: restData.discountType,
                amount: (discountAmount + variant.additionalDiscount)
              },
              (restData.mrp + variant.additionalMRP),
              'discountAmount'
            );
            const productVariantOptionExist = await this.productVariantOptionService.findOne({
              where: {
                productId: id,
                variantId: variant.variantId,
                variantOptionId: variant.variantOptionId,
              },
              relations: { variant: true, variantOption: true }
            });

            if (productVariantOptionExist) {
              const vSaleAmount = Math.round((restData.mrp + variant.additionalMRP) - variantDiscount)
              await queryRunner.manager.save(
                Object.assign(new ProductVariantOption(), {
                  id: productVariantOptionExist.id,
                  productId: id,
                  ...variant,
                  saleAmount: vSaleAmount
                }),
              );
            } else {
              const vSaleAmount = Math.round(pSaleAmount + (variant.additionalMRP - variant.additionalDiscount))
              await queryRunner.manager.save(
                Object.assign(new ProductVariantOption(), {
                  productId: id,
                  ...variant,
                  saleAmount: vSaleAmount
                }),
              );
            }
          });
        }

        const updatedVariants = await queryRunner.manager.find(ProductVariantOption, {
          where: {
            productId: id,
          },
          select: {
            id: true,
            createdAt: true,
            stockQuantity: true,
            position: true,
            productId: true
          }
        })
        updatedVariants.forEach(uVariant => {
          productStockQuantity = productStockQuantity + uVariant.stockQuantity;
        });
        await queryRunner.manager.save(Product, { id, stockQuantity: productStockQuantity })
      }

      if (genres && genres.length > 0) {
        const deletedItems = genres.filter((genre) => genre.isDeleted);
        const newOrUpdatedItems = genres.filter((genre) => !genre.isDeleted);

        await asyncForEach(deletedItems, async (genre: ProductGenreUpdateDTO) => {
          await queryRunner.manager.delete(ProductGenre, {
            productId: id,
            genreId: genre.genreId,
          });
        });

        await asyncForEach(newOrUpdatedItems, async (genre: ProductGenreUpdateDTO) => {
          const productGenreExist = await this.productGenreService.findOne({
            where: {
              productId: id,
              genreId: genre.genreId,
            },
            relations: { genre: true }
          });

          if (productGenreExist) {
            await queryRunner.manager.save(
              Object.assign(new ProductGenre(), {
                id: productGenreExist.id,
                productId: id,
                genreId: genre.genreId,
              }),
            );
          } else {
            await queryRunner.manager.save(
              Object.assign(new ProductGenre(), {
                productId: id,
                genreId: genre.genreId,
              }),
            );
          }
        });
      }

      if (categories && categories.length > 0) {
        const deletedItems = categories.filter((category) => category.isDeleted);
        const newOrUpdatedItems = categories.filter((category) => !category.isDeleted);

        await asyncForEach(deletedItems, async (category: ProductCategoryUpdateDTO) => {
          await queryRunner.manager.delete(ProductCategory, {
            productId: id,
            categoryId: category.categoryId,
          });
        });

        await asyncForEach(newOrUpdatedItems, async (category: ProductCategoryUpdateDTO) => {
          const productCategoryExist = await this.productCategoryService.findOne({
            where: {
              productId: id,
              categoryId: category.categoryId,
            },
            relations: { category: true }
          });

          if (productCategoryExist) {
            await queryRunner.manager.save(
              Object.assign(new ProductCategory(), {
                id: productCategoryExist.id,
                productId: id,
                categoryId: category.categoryId,
              }),
            );
          } else {
            await queryRunner.manager.save(
              Object.assign(new ProductCategory(), {
                productId: id,
                categoryId: category.categoryId,
              }),
            );
          }
        });
      }

      if (medias && medias.length > 0) {
        const deletedItems = medias.filter((media) => media.isDeleted);
        const newOrUpdatedItems = medias.filter((media) => !media.isDeleted);

        await asyncForEach(deletedItems, async (media: ProductMediaUpdateDTO) => {
          await queryRunner.manager.delete(ProductMedia, {
            productId: id,
            galleryId: media.galleryId,
          });
        });

        await asyncForEach(newOrUpdatedItems, async (media: ProductMediaUpdateDTO) => {
          const productMediaExist = await this.productMediaService.findOne({
            where: {
              productId: id,
              galleryId: media.galleryId,
            },
            relations: { gallery: true }
          });

          if (productMediaExist) {
            await queryRunner.manager.save(
              Object.assign(new ProductMedia(), {
                id: productMediaExist.id,
                productId: id,
                galleryId: media.galleryId,
              }),
            );
          } else {
            await queryRunner.manager.save(
              Object.assign(new ProductMedia(), {
                productId: id,
                galleryId: media.galleryId,
              }),
            );
          }
        });
      }

      await queryRunner.commitTransaction();

      return this.findOne({
        where: { id, },
        relations,
      });

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async generateUniqueCode(queryRunner: QueryRunner): Promise<string> {
    let counter = 0;
    let isExist = true;
    let code: string;

    while (isExist) {
      code = `${generateCode(ENV.systemConfig.productCodePrefix)}${counter}`;

      isExist = await queryRunner.manager.exists(Product, {
        where: { code },
      });

      if (isExist) {
        counter++;
      }
    }
    return code;
  }

  async checkProductIfOrderdByUser(userId: string, productId: string): Promise<SuccessResponse> {
    const isExist = await this.orderService.findOne({
      where:
        [
          {
            userId,
            status: ENUM_INTERNAL_ORDER_STATUS.DELIVERED,
            items: [{ productId }]
          },
          {
            userId,
            status: ENUM_INTERNAL_ORDER_STATUS.DELIVERED,
            items: [{ productVariant: { productId } }]
          }
        ],
    })
    if (isExist)
      return new SuccessResponse('', {
        hasOrdered: true,
        orderId: isExist.id
      })
    else
      return new SuccessResponse('', {
        hasOrdered: false,
        orderId: null
      })
  }

  async getProductBySlugOrId(idOrSlug: string, by: 'id' | 'slug' = 'slug'): Promise<Product> {
    return this.findOne({
      where: by === 'id' ? { id: idOrSlug } : { slug: idOrSlug },
      relations: {
        author: true,
        translator: true,
        publication: true,
        category: true,
        brand: true,
        variants: { variant: true, variantOption: true },
        medias: { gallery: true },
        // tags: { tag: true },
        genres: { genre: true },
        categories: { category: true },
      },
      select: {
        id: true,
        createdAt: true,
        title: true,
        subTitle: true,
        slug: true,
        alias: true,
        code: true,
        thumb: true,
        videoUrl: true,
        flap: true,
        mrp: true,
        saleAmount: true,
        discountType: true,
        discountAmount: true,
        sku: true,
        stockStatus: true,
        language: true,
        origin: true,
        pageCount: true,
        hasVariant: true,
        ratingPointAvg: true,
        ratingCount: true,
        description: true,
        categoryId: true,
        authorId: true,
        translatorId: true,
        publicationId: true,
        brandId: true,
        type: true,
        author: { id: true, name: true },
        translator: { id: true, name: true },
        publication: { id: true, name: true },
        category: { id: true, title: true },
        brand: { id: true, title: true },
        tags: true,
        genres: true,
        // categories: { category: { id: true, title: true } },
        categories: true,
      }
    });

    // if (!product) {
    //   throw new NotFoundException('Product not found');
    // }

    // const relatedProducts = await this.getRelatedProducts(product.id);

    // return {
    //   ...product,
    //   relatedProducts,
    // };
  }

  async getRelatedProducts(productId: string, limit = 10): Promise<Product[]> {
    // Step 1: Fetch minimal info
    const product = await this.findOne({
      where: { id: productId },
      relations: {
        // tags: true,
        genres: true,
        categories: true
      },
      select: {
        id: true,
        type: true,
        categoryId: true,
        tags: true,
        genres: { genreId: true },
        categories: { categoryId: true },
      },
    });

    if (!product) throw new NotFoundException('Product not found');

    // const tagIds = product.tags?.map(t => t.tagId) ?? [];
    const genreIds = product.genres?.map(g => g.genreId) ?? [];
    const categoryIds = product.categories?.map(c => c.categoryId) ?? [];

    // Step 2: Build candidate query
    const qb = this._repo
      .createQueryBuilder('p')
      .select([
        'p.id',
        'p.title',
        'p.slug',
        'p.code',
        'p.thumb',
        'p.mrp',
        'p.saleAmount',
        'p.discountType',
        'p.discountAmount',
        'p.stockStatus',
        'p.hasVariant',
        'p.ratingPointAvg',
        'p.ratingCount',
      ])
      .where('p.id != :id', { id: product.id })
      .take(limit);

    // if (tagIds.length) {
    //   qb.leftJoin('p.tags', 'tag').orWhere('tag.tagId IN (:...tagIds)', { tagIds });
    // }
    if (product.type === ENUM_PRODUCT_TYPE.BOOK && genreIds.length) {
      qb.leftJoin('p.genres', 'genre').orWhere('genre.genreId IN (:...genreIds)', { genreIds });
    }

    // Always fallback to same category
    if (categoryIds.length) {
      qb.orWhere('p.categoryId IN (:...categoryIds)', { categoryIds });
    }

    // Step 3: Faster randomness
    qb.orderBy('p.id', 'DESC'); // deterministic + indexed
    // Alternative: fast pseudo-random
    // qb.orderBy('md5(p.id::text)'); 

    // Step 4: Execute
    return qb.getMany();
  }

  async getProductWithRelatedProducts(idOrSlug: string, by: 'id' | 'slug' = 'slug'): Promise<Product & { relatedProducts: Product[] }> {
    // Fetch main product
    const product = await this.findOne({
      where: by === 'id' ? { id: idOrSlug } : { slug: idOrSlug },
      relations: {
        author: true,
        translator: true,
        publication: true,
        category: true,
        brand: true,
        variants: {
          variant: true,
          variantOption: true
        },
        medias: { gallery: true },
        genres: { genre: true },
      },
      select: {
        id: true,
        createdAt: true,
        title: true,
        subTitle: true,
        slug: true,
        alias: true,
        code: true,
        thumb: true,
        videoUrl: true,
        flap: true,
        mrp: true,
        saleAmount: true,
        discountType: true,
        discountAmount: true,
        stockStatus: true,
        hasVariant: true,
        ratingPointAvg: true,
        ratingCount: true,
        description: true,
        categoryId: true,
        authorId: true,
        translatorId: true,
        publicationId: true,
        brandId: true,
        type: true,
        author: { id: true, name: true },
        translator: { id: true, name: true },
        publication: { id: true, name: true },
        category: { id: true, title: true },
        brand: { id: true, title: true },
        tags: true,
        genres: { genre: { id: true, title: true } },
        categories: { category: { id: true, title: true } },
      }
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Get tag IDs
    // const tagIds = product.tags?.map(t => t.tagId) ?? [];

    let relatedProducts: Product[] = [];

    if (product.tags?.length) {
      const tags = product.tags;
      // Tag-based related products
      relatedProducts = await this._repo
        .createQueryBuilder('p')
        .select([
          'p.id',
          'p.title',
          'p.slug',
          'p.code',
          'p.thumb',
          'p.mrp',
          'p.saleAmount',
          'p.discountType',
          'p.discountAmount',
          'p.stockStatus',
          'p.hasVariant',
          'p.ratingPointAvg',
          'p.ratingCount',
        ])
        // .leftJoin('p.tags', 'tag')
        .where('tags IN (:...tags)', { tags })
        .andWhere('p.id != :id', { id: product.id })
        .addSelect('RANDOM()', 'rand') // <-- Add RANDOM() to select list
        .orderBy('rand')               // <-- Order by alias instead
        .take(10)
        .getMany();
    }

    // Fallback to same-category if no related found via tags
    if (!relatedProducts.length) {
      const genreIds = product.genres?.map(g => g.genreId) ?? [];
      if (product.type === ENUM_PRODUCT_TYPE.BOOK && genreIds.length) {
        // Tag-based related products
        relatedProducts = await this._repo
          .createQueryBuilder('p')
          .leftJoin('p.genres', 'genre')
          .select([
            'p.id',
            'p.title',
            'p.slug',
            'p.code',
            'p.thumb',
            'p.mrp',
            'p.saleAmount',
            'p.discountType',
            'p.discountAmount',
            'p.stockStatus',
            'p.hasVariant',
            'p.ratingPointAvg',
            'p.ratingCount',
          ])
          .where('genre.genreId IN (:...genreIds)', { genreIds })
          .andWhere('p.id != :id', { id: product.id })
          .addSelect('RANDOM()', 'rand') // <-- Add RANDOM() to select list
          .orderBy('rand')               // <-- Order by alias instead
          .take(10)
          .getMany();
      }
      if (!relatedProducts.length) {
        relatedProducts = await this.find({
          where: { categoryId: In(product.categories.map(c => c.categoryId)), id: Not(product.id) },
          select: {
            id: true,
            title: true,
            slug: true,
            code: true,
            thumb: true,
            videoUrl: true,
            mrp: true,
            saleAmount: true,
            discountType: true,
            discountAmount: true,
            stockStatus: true,
            hasVariant: true,
            ratingPointAvg: true,
            ratingCount: true,
          },
          take: 10,
          order: { createdAt: 'DESC' },
        });
      }
    }
    const result = {
      ...product,
      relatedProducts,
    };
    return result;
  }

  async updateProductRating(productId: string): Promise<Product> {
    // 1. Get all reviews for the product
    const reviews = await this.productReviewService.find({
      where: { product: { id: productId } },
      select: { 'rating': true },
    });

    if (reviews.length === 0) {
      // reset to default if no reviews
      return this.repo.save({
        id: productId,
        ratingCount: 0,
        ratingPointTotal: 0,
        ratingPointAvg: 0,
        ratings: { one: 0, two: 0, three: 0, four: 0, five: 0 },
      });
    }

    // 2. Count totals
    const ratingCount = reviews.length;
    const ratingPointTotal = reviews.reduce((sum, r) => sum + (r.rating ?? 0), 0);
    const ratingPointAvg = Math.round(ratingPointTotal / ratingCount);

    // 3. Prepare histogram
    const ratings = { one: 0, two: 0, three: 0, four: 0, five: 0 };
    reviews.forEach((r) => {
      if (r.rating && r.rating >= 1 && r.rating <= 5) {
        const key = ['one', 'two', 'three', 'four', 'five'][r.rating - 1] as keyof typeof ratings;
        ratings[key] += 1;
      }
    });

    // 4. Update product
    return this.repo.save({
      id: productId,
      ratingCount,
      ratingPointTotal,
      ratingPointAvg,
      ratings,
    });
  }

  /**
 * Incrementally updates product rating stats when a new review is added.
 */
  async applyNewRating(productId: string, newRating: number): Promise<Product> {
    const product = await this.repo.findOneByOrFail({ id: productId });
    // Update histogram
    const ratings = { ...product.ratings };
    const key = ['one', 'two', 'three', 'four', 'five'][newRating - 1] as keyof typeof ratings;
    ratings[key] = (ratings[key] ?? 0) + 1;

    // Update counts
    const ratingCount = (product.ratingCount ?? 0) + 1;
    const ratingPointTotal = (product.ratingPointTotal ?? 0) + newRating;
    const ratingPointAvg = Math.round(ratingPointTotal / ratingCount);

    // Save back
    return this.repo.save({
      ...product,
      ratingCount,
      ratingPointTotal,
      ratingPointAvg,
      ratings,
    });
  }

  /**
  * Adjusts stats when an existing review’s rating is changed.
  */
  async updateRating(productId: string, oldRating: number, newRating: number): Promise<Product> {
    const product = await this.repo.findOneByOrFail({ id: productId });

    const ratings = { ...product.ratings };

    // decrement old bucket
    if (oldRating >= 1 && oldRating <= 5) {
      const oldKey = ['one', 'two', 'three', 'four', 'five'][oldRating - 1] as keyof typeof ratings;
      ratings[oldKey] = Math.max((ratings[oldKey] ?? 1) - 1, 0);
    }

    // increment new bucket
    if (newRating >= 1 && newRating <= 5) {
      const newKey = ['one', 'two', 'three', 'four', 'five'][newRating - 1] as keyof typeof ratings;
      ratings[newKey] = (ratings[newKey] ?? 0) + 1;
    }

    // Update totals
    const ratingPointTotal = (product.ratingPointTotal ?? 0) - oldRating + newRating;
    const ratingPointAvg = Math.round(ratingPointTotal / (product.ratingCount ?? 1));

    return this.repo.save({
      ...product,
      ratingPointTotal,
      ratingPointAvg,
      ratings,
    });
  }
}
