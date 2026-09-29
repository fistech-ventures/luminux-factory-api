import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@src/app/base';
import { asyncForEach } from '@src/shared';
import { FindOptionsRelations, FindOptionsWhere, Not, Repository } from 'typeorm';
import { ProductCreateDTO } from '../dtos/product/create.dto';
import { ProductVariantSkuDTO } from '../dtos/product/create.dto';
import { ProductUpdateDTO, ProductVariantSkuUpdateDTO } from '../dtos/product/update.dto';
import { Product } from '../entities/product.entity';
import { ProductVariantOption } from '../entities/productVariantOption.entity';
import { ProductVariantSku } from '../entities/productVariantSku.entity';
import { ProductVariantSkuValue } from '../entities/productVariantSkuValue.entity';

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
    skus: { values: { variant: true, variantOption: true } },
  };

  async createProduct(payload: ProductCreateDTO): Promise<Product> {
    const { variants, skus, ...restPayload } = payload;

    let productStock = 0;
    if (skus?.length) {
      productStock = skus.reduce((sum, sku) => sum + (sku.stockQuantity || 0), 0);
    } else if (variants?.length) {
      productStock = variants.reduce((sum, v) => sum + (v.stockQuantity || 0), 0);
    } else {
      productStock = payload.stock || 0;
    }

    const productCode = payload.productCode?.trim();
    if (!productCode) {
      throw new BadRequestException('Product code is required');
    }

    const existingProduct = await this.findOneIncludingDeleted({
      where: { productCode },
    });
    if (existingProduct) {
      if (!existingProduct.isDeleted && !existingProduct.deletedAt) {
        throw new BadRequestException(`Product code already exists: ${productCode}`);
      }
      await this._repo.update(
        existingProduct.id,
        { isDeleted: false, deletedAt: null } as any,
      );
      return this.updateProduct(existingProduct.id, {
        ...restPayload,
        productCode,
        stock: productStock,
        variants,
        skus,
      } as ProductUpdateDTO);
    }

    await this.assertUniqueProductCode(productCode);

    const saved = await this._repo.save(
      Object.assign(new Product(), {
        ...restPayload,
        sourcingPrice: restPayload.sourcingPrice ?? 0,
        sellingPrice: restPayload.sellingPrice ?? 0,
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

    if (skus?.length) {
      await this.saveSkus(saved.id, skus);
    }

    return this.findByIdBase(saved.id, { relations: this.RELATIONS });
  }

  async updateProduct(id: string, payload: ProductUpdateDTO): Promise<Product> {
    const product = await this.isExist({ id: id as any });
    const { variants, skus } = payload;
    const updates: any = { ...payload };
    delete updates.variants;
    delete updates.skus;

    if (updates.sourcingPrice == null) delete updates.sourcingPrice;
    if (updates.sellingPrice == null) delete updates.sellingPrice;
    if (updates.stock == null) delete updates.stock;

    if (updates.productCode) {
      const productCode = updates.productCode.trim();
      await this.assertUniqueProductCode(productCode, id);
      updates.productCode = productCode;
    }

    if (Object.keys(updates).length) {
      await this.updateOneBase(id, updates);
    }

    // -------------------------------------------------------------------
    // OPTION SYNC -------------------------------------------------
    // product_variant_options behave exactly like variant options:
    // they are NEVER hard-deleted. Rows the UI marks isDeleted = true are
    // soft-deleted. Before a soft delete goes through we check that the
    // remaining (active) product / SKU combinations do not still reference
    // it, because the UI has no way to handle a row that has been hard
    // deleted.
    // -------------------------------------------------------------------
    if (variants?.length) {
      const queryRunner = this._repo.manager.queryRunner;
      if (!queryRunner) {
        throw new BadRequestException(
          'No active query runner. Please use the service inside a transaction.',
        );
      }
      await queryRunner.startTransaction();
      try {
        for (const variant of variants) {
          if (variant.isDeleted) {
            if (!variant.id) {
              throw new BadRequestException(
                'Cannot delete a variant option that has no id. Add a new option instead.',
              );
            }

            // Deletions represent the same logical row, so look up by the
            // underlying variant option id — and include soft-deleted rows
            // so we can check the references even for one the UI had removed.
            const inUse = await queryRunner.manager.findOne(ProductVariantOption, {
              where: { variantOptionId: variant.id, productId: id, isDeleted: false },
            });

            if (inUse) {
              throw new BadRequestException(
                'Cannot delete a variant option because it is still referenced by an existing product combination. Remove the reference from the product first.',
              );
            }

            // Soft-delete instead of hard delete.
            await queryRunner.manager.update(
              ProductVariantOption,
              { variantOptionId: variant.id, productId: id },
              { isDeleted: true, deletedAt: new Date() },
            );
          } else {
            const option = await queryRunner.manager.findOne(ProductVariantOption, {
              where: variant.id
                ? { id: variant.id, productId: id }
                : {
                    productId: id,
                    variantId: variant.variantId,
                    variantOptionId: variant.variantOptionId,
                  },
              withDeleted: true,
            });

            if (option) {
              // `findOne` returns soft-deleted rows too, so a re-add of a
              // previously removed option finds it here. Revive it, otherwise the
              // row would stay invisible after the user sent it back above.
              await queryRunner.manager.update(
                ProductVariantOption,
                { id: option.id },
                {
                  sku: variant.sku ?? option.sku,
                  sellingPrice: variant.sellingPrice ?? option.sellingPrice ?? 0,
                  stockQuantity: variant.stockQuantity ?? option.stockQuantity ?? 0,
                  position: variant.position ?? option.position ?? 0,
                  variantId: variant.variantId ?? option.variantId,
                  variantOptionId: variant.variantOptionId ?? option.variantOptionId,
                  isDeleted: false,
                  deletedAt: null,
                },
              );
            } else {
              await queryRunner.manager.save(
                Object.assign(new ProductVariantOption(), {
                  ...variant,
                  sellingPrice: variant.sellingPrice ?? product.sellingPrice ?? 0,
                  productId: id,
                }),
              );
            }
          }
        }

        // Recompute stock from the *remaining active* option rows only.
        const optionRows = await queryRunner.manager.find(ProductVariantOption, {
          where: { productId: id, isDeleted: false },
          select: { id: true, stockQuantity: true },
        });
        const totalStock = optionRows.reduce((sum, o) => sum + (o.stockQuantity || 0), 0);
        await this.updateOneBase(id, { stock: totalStock } as any);

        await queryRunner.commitTransaction();
      } catch (_error) {
        await queryRunner.rollbackTransaction();
        throw new BadRequestException('Something went wrong while saving variant data!');
      } finally {
        await queryRunner.release();
      }
    }

    if (skus) {
      await this.updateSkus(id, skus);
    }

    return this.findByIdBase(id, { relations: this.RELATIONS });
  }

  async assertUniqueProductCode(code: string, excludeId?: string): Promise<void> {
    const where: FindOptionsWhere<Product> = { productCode: code };
    if (excludeId) {
      where.id = Not(excludeId);
    }
    const existing = await this.findOneIncludingDeleted({ where });
    if (existing) {
      throw new BadRequestException(`Product code already exists: ${code}`);
    }
  }

  async updateStock(id: string, quantity: number): Promise<Product> {
    const product = await this.isExist({ id: id as any });
    const newStock = Math.max(0, (product.stock || 0) + quantity);
    return this.updateOneBase(id, { stock: newStock } as any);
  }

  async updateSourcingPrice(id: string, newSourcingPrice: number): Promise<Product> {
    const product = await this.isExist({ id: id as any });
    const currentSourcingPrice = product.sourcingPrice || 0;
    const averageSourcingPrice = (currentSourcingPrice + newSourcingPrice) / 2;
    const updates: any = { sourcingPrice: averageSourcingPrice };

    if ((product.sellingPrice || 0) < averageSourcingPrice) {
      updates.sellingPrice = averageSourcingPrice;
    }

    return this.updateOneBase(id, updates as any);
  }

  async assertUniqueSkuCode(code: string, excludeId?: string): Promise<void> {
    const existing = await this._repo.manager.findOne(ProductVariantSku, {
      where: { productCode: code },
      withDeleted: true,
    });
    if (existing && existing.id !== excludeId)
      throw new BadRequestException(`SKU code already exists: ${code}`);
  }

  private async saveSkus(productId: string, skus: ProductVariantSkuDTO[]): Promise<void> {
    const codes = new Set<string>();
    for (const sku of skus) {
      const { values, ...skuData } = sku;
      const code = sku.productCode.trim();
      if (codes.has(code)) throw new BadRequestException(`Duplicate SKU code: ${code}`);
      codes.add(code);
      await this.assertUniqueSkuCode(code);
      this.assertSkuValues(values);
      const savedSku = await this._repo.manager.save(ProductVariantSku, {
        ...skuData,
        productCode: code,
        productId,
      });
      await this._repo.manager.save(
        values.map((value, position) =>
          this._repo.manager.create(ProductVariantSkuValue, {
            ...value,
            position,
            skuId: savedSku.id,
          }),
        ),
      );
    }
  }

  private async updateSkus(productId: string, skus: ProductVariantSkuUpdateDTO[]): Promise<void> {
    const queryRunner = this._repo.manager.queryRunner;
    if (!queryRunner) {
      throw new BadRequestException(
        'No active query runner. Please use the service inside a transaction.',
      );
    }
    await queryRunner.startTransaction();
    try {
      for (const sku of skus) {
        if (sku.isDeleted) {
          if (!sku.id) {
            throw new BadRequestException(
              'Cannot delete a SKU that has no id. Add a new SKU instead.',
            );
          }
          const existingSku = await queryRunner.manager.findOne(ProductVariantSku, {
            where: { id: sku.id, productId },
          });
          if (!existingSku) {
            throw new BadRequestException(`SKU ${sku.id} not found for product ${productId}.`);
          }
          // Soft-delete instead of hard delete.
          await queryRunner.manager.update(
            ProductVariantSku,
            { id: sku.id, productId },
            { isDeleted: true, deletedAt: new Date() },
          );
          continue;
        }

        const { values, id, ...skuData } = sku;
        this.assertSkuValues(values);
        const code = sku.productCode.trim();
        const existing = await queryRunner.manager.findOne(ProductVariantSku, {
          where: id ? { id, productId } : { productId, productCode: code },
          withDeleted: true,
        });
        await this.assertUniqueSkuCode(code, existing?.id ?? id);
        const savedSku = existing
          ? await queryRunner.manager.save(ProductVariantSku, {
              ...existing,
              ...skuData,
              productCode: code,
              isDeleted: false,
              deletedAt: null,
            })
          : await queryRunner.manager.save(ProductVariantSku, {
              ...skuData,
              productCode: code,
              productId,
            });

        // Replace values but soft-delete any that are no longer referenced.
        if (values?.length) {
          const currentValues = await queryRunner.manager.find(ProductVariantSkuValue, {
            where: { skuId: savedSku.id },
            withDeleted: true,
          });

          for (const current of currentValues) {
            const stillPresent = values.some((v) => v.variantOptionId === current.variantOptionId);
            if (!stillPresent) {
              await queryRunner.manager.update(
                ProductVariantSkuValue,
                { id: current.id },
                { isDeleted: true, deletedAt: new Date() },
              );
            }
          }

          for (const value of values) {
            const existingValue = currentValues.find(
              (currentValue) => currentValue.variantOptionId === value.variantOptionId,
            );

            if (existingValue) {
              // same as above: the find() above returned this row from a previous
              // "delete", so save the re-add as a revival instead of a silent
              // invisible update.
              await queryRunner.manager.update(
                ProductVariantSkuValue,
                { id: existingValue.id },
                {
                  variantId: value.variantId,
                  variantOptionId: value.variantOptionId,
                  position: values.findIndex(
                    (item) => item.variantOptionId === value.variantOptionId,
                  ),
                  isDeleted: false,
                  deletedAt: null,
                },
              );
            } else {
              await queryRunner.manager.save(ProductVariantSkuValue, {
                ...value,
                position: values.findIndex((v) => v.variantOptionId === value.variantOptionId),
                skuId: savedSku.id,
              });
            }
          }
        } else {
          // SKU has no values defined: soft-delete all existing values.
          const currentValues = await queryRunner.manager.find(ProductVariantSkuValue, {
            where: { skuId: savedSku.id },
          });
          for (const current of currentValues) {
            await queryRunner.manager.update(
              ProductVariantSkuValue,
              { id: current.id },
              { isDeleted: true, deletedAt: new Date() },
            );
          }
        }
      }

      // Recompute stock from the remaining active SKU rows only.
      const skuRows = await queryRunner.manager.find(ProductVariantSku, {
        where: { productId, isDeleted: false },
        select: { id: true, stockQuantity: true },
      });
      const totalStock = skuRows.reduce((sum, sku) => sum + (sku.stockQuantity || 0), 0);
      await this.updateOneBase(productId, { stock: totalStock } as any);

      await queryRunner.commitTransaction();
    } catch (_error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException('Something went wrong while saving SKU data!');
    } finally {
      await queryRunner.release();
    }
  }

  private assertSkuValues(values: Array<{ variantId: string; variantOptionId: string }>): void {
    const variants = new Set<string>();
    const options = new Set<string>();
    for (const value of values) {
      if (variants.has(value.variantId))
        throw new BadRequestException('A SKU cannot repeat an attribute');
      if (options.has(value.variantOptionId))
        throw new BadRequestException('A SKU cannot repeat an option');
      variants.add(value.variantId);
      options.add(value.variantOptionId);
    }
  }
}
