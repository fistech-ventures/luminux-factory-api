import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@src/app/base';
import { asyncForEach } from '@src/shared';
import { DataSource, FindOptionsRelations, In, Repository } from 'typeorm';
import { CreateOfferDto } from '../dtos/offer/create.dto';
import { UpdateOfferDto } from '../dtos/offer/update.dto';
import { DiscountRule } from '../entities/discount-rule.entity';
import { Offer } from '../entities/offer.entity';
import { OfferScope } from '../entities/offer-scope.entity';
import { Product } from '../../product/entities/product.entity';
import { ProductVariantOption } from '../../product/entities/productVariantOption.entity';

@Injectable()
export class OfferService extends BaseService<Offer> {
  constructor(
    @InjectRepository(Offer)
    private readonly _repo: Repository<Offer>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(ProductVariantOption)
    private readonly variantRepo: Repository<ProductVariantOption>,
    private readonly dataSource: DataSource,
  ) {
    super(_repo);
  }

  RELATIONS: FindOptionsRelations<Offer> = {
    rules: true,
    scopes: {
      category: true,
      product: true,
      productVariant: true,
    },
  };

  async create(dto: CreateOfferDto): Promise<Offer> {
    const { rules, scopes, ...offerData } = dto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const createdOffer = await queryRunner.manager.save(Offer, {
        ...offerData,
        createdBy: dto.createdBy,
      });

      if (rules && rules.length > 0) {
        await asyncForEach(rules, async (rule) => {
          await queryRunner.manager.save(DiscountRule, {
            ...rule,
            offerId: createdOffer.id,
            createdBy: dto.createdBy,
          });
        });
      }

      if (scopes && scopes.length > 0) {
        await asyncForEach(scopes, async (scope) => {
          await queryRunner.manager.save(OfferScope, {
            ...scope,
            offerId: createdOffer.id,
            createdBy: dto.createdBy,
          });
        });
      }

      await queryRunner.commitTransaction();
      return this.findByIdBase(createdOffer.id, { relations: this.RELATIONS });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(): Promise<Offer[]> {
    return this.find({
      where: { isActive: true },
      relations: this.RELATIONS,
      order: { priority: 'DESC', createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Offer> {
    const offer = await this.findByIdBase(id, { relations: this.RELATIONS });
    if (!offer) {
      throw new NotFoundException('Offer not found');
    }
    return offer;
  }

  async update(id: string, dto: UpdateOfferDto): Promise<Offer> {
    await this.isExist({ id });

    const { rules, scopes, ...offerData } = dto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (Object.keys(offerData).length > 0) {
        await queryRunner.manager.save(Offer, {
          ...offerData,
          id,
          updatedBy: dto.updatedBy,
        });
      }

      if (rules && rules.length > 0) {
        // Delete existing rules
        await queryRunner.manager.delete(DiscountRule, { offerId: id });

        // Create new rules
        await asyncForEach(rules, async (rule) => {
          await queryRunner.manager.save(DiscountRule, {
            ...rule,
            offerId: id,
            updatedBy: dto.updatedBy,
          });
        });
      }

      if (scopes && scopes.length > 0) {
        // Delete existing scopes
        await queryRunner.manager.delete(OfferScope, { offerId: id });

        // Create new scopes
        await asyncForEach(scopes, async (scope) => {
          await queryRunner.manager.save(OfferScope, {
            ...scope,
            offerId: id,
            updatedBy: dto.updatedBy,
          });
        });
      }

      await queryRunner.commitTransaction();
      return this.findById(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: string): Promise<void> {
    await this.isExist({ id });
    await this.deleteOneBase(id);
  }

  async toggleActive(id: string): Promise<Offer> {
    const offer = await this.isExist({ id });
    await this._repo.save({
      id,
      isActive: !offer.isActive,
    });
    return this.findById(id);
  }

  async findBySlug(slug: string): Promise<Offer> {
    const offer = await this._repo.findOne({
      where: { slug },
      relations: this.RELATIONS,
    });
    if (!offer) {
      throw new NotFoundException('Offer not found');
    }
    return offer;
  }

  async getProductsBySlug(slug: string): Promise<{
    offer: Offer;
    products: Array<Product & { discountTag?: string }>;
  }> {
    const offer = await this.findBySlug(slug);
    const scopes = offer.scopes || [];

    const productIds = new Set<string>();
    const variantIds = new Set<string>();

    for (const scope of scopes) {
      if (scope.scopeType === 'ALL_PRODUCTS') {
        const allProducts = await this.productRepo.find({
          where: { isActive: true },
          relations: { variants: true },
        });
        return {
          offer,
          products: allProducts.map((p) => ({
            ...p,
            discountTag: offer.tag,
          })),
        };
      }

      if (scope.scopeType === 'CATEGORY' && scope.categoryId) {
        const categoryProducts = await this.productRepo
          .createQueryBuilder('product')
          .leftJoin('product.categories', 'category')
          .where('product.isActive = :isActive', { isActive: true })
          .andWhere('category.id = :categoryId', { categoryId: scope.categoryId })
          .getMany();
        categoryProducts.forEach((p) => productIds.add(p.id));
      }

      if (scope.scopeType === 'PRODUCT' && scope.productId) {
        productIds.add(scope.productId);
      }

      if (scope.scopeType === 'VARIANT' && scope.productVariantId) {
        variantIds.add(scope.productVariantId);
      }
    }

    // If we have variant scopes, fetch variants and get their parent products
    if (variantIds.size > 0) {
      const variants = await this.variantRepo.find({
        where: { id: In([...variantIds]) },
        relations: { product: true },
      });
      variants.forEach((v) => {
        if (v.product) {
          productIds.add(v.product.id);
        }
      });
    }

    const products = await this.productRepo.find({
      where: { id: In([...productIds]), isActive: true },
      relations: { variants: true },
    });

    const productsWithTag = products.map((p) => ({
      ...p,
      discountTag: offer.tag,
    }));

    return {
      offer,
      products: productsWithTag,
    };
  }
}
