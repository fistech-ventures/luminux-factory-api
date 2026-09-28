import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@src/app/base/base.service';
import { asyncForEach } from '@src/shared';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { Variant } from '../entities/variant.entity';
import { VariantOption } from '../entities/variantOption.entity';
import { ProductVariantOption } from '../entities/productVariantOption.entity';
import { ProductVariantSkuValue } from '../entities/productVariantSkuValue.entity';
@Injectable()
export class VariantService extends BaseService<Variant> {
  constructor(
    @InjectRepository(Variant)
    public readonly _repo: Repository<Variant>,
    private readonly dataSource: DataSource,
  ) {
    super(_repo);
  }

  async createOne(data): Promise<Variant> {
    const { options, ...variant } = data;
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const savedVariant = await queryRunner.manager.save(Variant, variant);
      if (options?.length) {
        await asyncForEach(options, async (op) => {
          await queryRunner.manager.save(VariantOption, {
            ...op,
            variantId: savedVariant?.id,
          });
        });
      }
      await queryRunner.commitTransaction();
      return this.findByIdBase(savedVariant?.id, { relations: { options: true } });
    } catch (error) {
      console.info('🚀 ~ VariantService ~ createOne ~ error:', error);
      await queryRunner.rollbackTransaction();
      throw new BadRequestException('Something went wrong while saving variant data!');
    } finally {
      await queryRunner.release();
    }
  }

  async updateOne(id: string, data): Promise<Variant> {
    const { options, ...variantData } = data;
    const isExist = await this.findByIdBase(id);
    if (!isExist) throw new NotFoundException('Variant not found!');
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.update(Variant, { id }, variantData);

      // -------------------------------------------------------------------
      // OPTION SYNC -------------------------------------------------
      // All changes to variant options now happen inside ONE transaction.
      // - A row that the UI still references is saved (INSERT / UPDATE).
      // - A row the UI marks isDeleted = true is soft-deleted (isDeleted
      //   becomes true). The row is NEVER hard-deleted at the database
      //   level: soft-deleted options are ignored by every upstream read
      //   query, and the DB now blocks any attempt to hard-delete them.
      // - Before any row is soft-deleted we verify that no product / SKU
      //   combination still references the underlying variant option.
      //   If it does we throw, so the change is rolled back and an admin can
      //   reconcile the reference manually instead of silently losing data.
      // -------------------------------------------------------------------
      if (options?.length) {
        await asyncForEach(options, async (op) => {
          if (op?.isDeleted) {
            const variantOptionId = op.id;
            if (!variantOptionId) {
              throw new BadRequestException(
                'Cannot delete a variant option that has no id. Add a new option instead.',
              );
            }

            // 1. Does any product_variant_option row still reference this variant option?
            const productVariantOptionInUse = await queryRunner.manager.findOne(ProductVariantOption, {
              where: { variantOptionId },
            });

            // 2. Same check for product_variant_sku_values.
            const productVariantSkuValueInUse = await queryRunner.manager.findOne(ProductVariantSkuValue, {
              where: { variantOptionId },
            });

            if (productVariantOptionInUse || productVariantSkuValueInUse) {
              const usedBy = [];
              if (productVariantOptionInUse) {
                usedBy.push(
                  `product variant option (id: ${productVariantOptionInUse.id}, product: ${productVariantOptionInUse.productId})`,
                );
              }
              if (productVariantSkuValueInUse) {
                usedBy.push(
                  `product variant sku value (id: ${productVariantSkuValueInUse.id}, sku: ${productVariantSkuValueInUse.skuId})`,
                );
              }
              throw new BadRequestException(
                'Cannot delete variant option because it is still referenced by an existing product or SKU combination. Use a soft delete or remove the reference from the product first.',
              );
            }

            // 3. Soft-delete. Nothing is hard-deleted.
            await queryRunner.manager.update(
              VariantOption,
              { id: variantOptionId, variantId: id },
              { isDeleted: true },
            );
          } else {
            // 4. Insert / update a live option.
            await queryRunner.manager.save(VariantOption, {
              ...op,
              variantId: id,
            });
          }
        });
      }

      await queryRunner.commitTransaction();
      return this.findByIdBase(id);
    } catch (error) {
      console.info('🚀 ~ VariantService ~ updateOne ~ error:', error);
      await queryRunner.rollbackTransaction();
      throw new BadRequestException('Something went wrong while saving variant data!');
    } finally {
      await queryRunner.release();
    }
  }
}