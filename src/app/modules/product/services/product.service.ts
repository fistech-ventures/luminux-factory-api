import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@src/app/base';
import { asyncForEach } from '@src/shared';
import { FindOptionsRelations, FindOptionsWhere, Not, Repository } from 'typeorm';
import { ProductCreateDTO } from '../dtos/product/create.dto';
import { ProductUpdateDTO } from '../dtos/product/update.dto';
import { Product } from '../entities/product.entity';
import { ProductVariantOption } from '../entities/productVariantOption.entity';

@Injectable()
export class ProductService extends BaseService<Product> {
  constructor(
    @InjectRepository(Product)
    private readonly _repo: Repository<Product>,
  ) {
    super(_repo);
  }

  public readonly RELATIONS: FindOptionsRelations<Product> = {
    variants: { variant: true, variantOption: true },
  };

  async createProduct(payload: ProductCreateDTO): Promise<Product> {
    const { variants, ...restPayload } = payload;

    let productStock = 0;
    if (variants?.length) {
      productStock = variants.reduce((sum, v) => sum + (v.stockQuantity || 0), 0);
    } else {
      productStock = payload.stock || 0;
    }

    const productCode = payload.productCode?.trim();
    if (!productCode) {
      throw new BadRequestException('Product code is required');
    }
    await this.assertUniqueProductCode(productCode);

    const saved = await this._repo.save(
      Object.assign(new Product(), {
        ...restPayload,
        productCode,
        stock: productStock,
      }),
    );

    if (variants?.length) {
      await asyncForEach(variants, async (variant) => {
        await this._repo.manager.save(
          Object.assign(new ProductVariantOption(), {
            ...variant,
            sellingPrice: variant.sellingPrice ?? payload.sellingPrice ?? 0,
            productId: saved.id,
          }),
        );
      });
    }

    return this.findByIdBase(saved.id, { relations: this.RELATIONS });
  }

  async updateProduct(id: string, payload: ProductUpdateDTO): Promise<Product> {
    const product = await this.isExist({ id: id as any });
    const { variants } = payload;
    const updates: any = { ...payload };
    delete updates.variants;

    if (updates.productCode) {
      const productCode = updates.productCode.trim();
      await this.assertUniqueProductCode(productCode, id);
      updates.productCode = productCode;
    }

    if (Object.keys(updates).length) {
      await this.updateOneBase(id, updates);
    }

    if (variants?.length) {
      for (const variant of variants) {
        if (variant.isDeleted) {
          if (variant.id) {
            await this._repo.manager.delete(ProductVariantOption, {
              id: variant.id,
              productId: id,
            });
          }
          continue;
        }

        const option = await this._repo.manager.findOne(ProductVariantOption, {
          where: variant.id
            ? { id: variant.id, productId: id }
            : { productId: id, variantId: variant.variantId, variantOptionId: variant.variantOptionId },
        });

        if (option) {
          await this._repo.manager.update(ProductVariantOption, { id: option.id }, {
            sku: variant.sku ?? option.sku,
            sellingPrice: variant.sellingPrice ?? option.sellingPrice ?? 0,
            stockQuantity: variant.stockQuantity ?? option.stockQuantity ?? 0,
            position: variant.position ?? option.position ?? 0,
            variantId: variant.variantId ?? option.variantId,
            variantOptionId: variant.variantOptionId ?? option.variantOptionId,
          });
        } else {
          await this._repo.manager.save(
            Object.assign(new ProductVariantOption(), {
              ...variant,
              sellingPrice: variant.sellingPrice ?? product.sellingPrice ?? 0,
              productId: id,
            }),
          );
        }
      }

      // When a product's variants are managed through the product, its total
      // stock mirrors the sum of the variant option stocks.
      const optionRows = await this._repo.manager.find(ProductVariantOption, {
        where: { productId: id },
        select: { id: true, stockQuantity: true },
      });
      const totalStock = optionRows.reduce((sum, o) => sum + (o.stockQuantity || 0), 0);
      await this.updateOneBase(id, { stock: totalStock } as any);
    }

    return this.findByIdBase(id, { relations: this.RELATIONS });
  }

  async assertUniqueProductCode(code: string, excludeId?: string): Promise<void> {
    const where: FindOptionsWhere<Product> = { productCode: code };
    if (excludeId) {
      where.id = Not(excludeId);
    }
    const isExist = await this._repo.exists({ where });
    if (isExist) {
      throw new BadRequestException(`Product code already exists: ${code}`);
    }
  }

<<<<<<< Updated upstream
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
=======
  async updateStock(id: string, quantity: number): Promise<Product> {
    const product = await this.isExist({ id: id as any });
    const newStock = Math.max(0, (product.stock || 0) + quantity);
    return this.updateOneBase(id, { stock: newStock } as any);
>>>>>>> Stashed changes
  }

  async updateSourcingPrice(id: string, newSourcingPrice: number): Promise<Product> {
    const product = await this.isExist({ id: id as any });
    const currentSourcingPrice = product.sourcingPrice || 0;
    const averageSourcingPrice = (currentSourcingPrice + newSourcingPrice) / 2;

    const updates: any = { sourcingPrice: averageSourcingPrice };

    // Never let a product be sold below cost: if the averaged sourcing price
    // exceeds the current selling price, bump the selling price up to match it.
    // Selling price is never lowered here and stays user-editable otherwise.
    if ((product.sellingPrice || 0) < averageSourcingPrice) {
      updates.sellingPrice = averageSourcingPrice;
    }

    return this.updateOneBase(id, updates as any);
  }
}
