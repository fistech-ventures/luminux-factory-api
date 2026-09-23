import { BaseEntity } from '@src/app/base';
import { ENUM_TABLE_NAMES } from '@src/shared';
import { Column, Entity, Index, ManyToOne, RelationId } from 'typeorm';
import { Variant } from './variant.entity';
import { VariantOption } from './variantOption.entity';
import { ProductVariantSku } from './productVariantSku.entity';

@Entity(ENUM_TABLE_NAMES.PRODUCT_VARIANT_SKU_VALUES)
export class ProductVariantSkuValue extends BaseEntity {
  @ManyToOne(() => ProductVariantSku, (sku) => sku.values, { onDelete: 'CASCADE' })
  sku?: ProductVariantSku;

  @Index()
  @RelationId((value: ProductVariantSkuValue) => value.sku)
  @Column({ nullable: false })
  skuId?: string;

  @ManyToOne(() => Variant, { onDelete: 'CASCADE' })
  variant?: Variant;

  @Index()
  @RelationId((value: ProductVariantSkuValue) => value.variant)
  @Column({ nullable: false })
  variantId?: string;

  @ManyToOne(() => VariantOption, { onDelete: 'CASCADE' })
  variantOption?: VariantOption;

  @Index()
  @RelationId((value: ProductVariantSkuValue) => value.variantOption)
  @Column({ nullable: false })
  variantOptionId?: string;
}