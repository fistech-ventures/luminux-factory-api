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
    const isExist = await this._repo.exists({ where });
    if (isExist) {
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
    const existing = await this._repo.manager.findOne(ProductVariantSku, { where: { productCode: code } });
    if (existing && existing.id !== excludeId) throw new BadRequestException(`SKU code already exists: ${code}`);
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
        values.map((value) => this._repo.manager.create(ProductVariantSkuValue, {
          ...value,
          skuId: savedSku.id,
        })),
      );
    }
  }

  private async updateSkus(productId: string, skus: ProductVariantSkuUpdateDTO[]): Promise<void> {
    for (const sku of skus) {
      if (sku.isDeleted) {
        if (sku.id) await this._repo.manager.delete(ProductVariantSku, { id: sku.id, productId });
        continue;
      }
      const { values, ...skuData } = sku;
      this.assertSkuValues(values);
      const code = sku.productCode.trim();
      await this.assertUniqueSkuCode(code, sku.id);
      const existing = sku.id
        ? await this._repo.manager.findOne(ProductVariantSku, { where: { id: sku.id, productId } })
        : undefined;
      const savedSku = existing
        ? await this._repo.manager.save(ProductVariantSku, { ...existing, ...skuData, productCode: code })
        : await this._repo.manager.save(ProductVariantSku, { ...skuData, productCode: code, productId });
      await this._repo.manager.delete(ProductVariantSkuValue, { skuId: savedSku.id });
      await this._repo.manager.save(
        values.map((value) => this._repo.manager.create(ProductVariantSkuValue, {
          ...value,
          skuId: savedSku.id,
        })),
      );
    }
    const skuRows = await this._repo.manager.find(ProductVariantSku, {
      where: { productId },
      select: { stockQuantity: true },
    });
    await this.updateOneBase(productId, {
      stock: skuRows.reduce((sum, sku) => sum + (sku.stockQuantity || 0), 0),
    } as any);
  }

  private assertSkuValues(values: Array<{ variantId: string; variantOptionId: string }>): void {
    const variants = new Set<string>();
    const options = new Set<string>();
    for (const value of values) {
      if (variants.has(value.variantId)) throw new BadRequestException('A SKU cannot repeat an attribute');
      if (options.has(value.variantOptionId)) throw new BadRequestException('A SKU cannot repeat an option');
      variants.add(value.variantId);
      options.add(value.variantOptionId);
    }
  }

}
