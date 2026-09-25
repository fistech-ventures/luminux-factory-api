import { BaseEntity } from '@src/app/base';
import { ENUM_COLUMN_TYPES, ENUM_TABLE_NAMES } from '@src/shared';
import { Column, Entity, Index, ManyToOne, RelationId } from 'typeorm';
import { Product } from './product.entity';
import { Variant } from './variant.entity';
import { VariantOption } from './variantOption.entity';

@Entity(ENUM_TABLE_NAMES.PRODUCT_VARIANT_OPTIONS, { orderBy: { position: 'ASC' } })
export class ProductVariantOption extends BaseEntity {
  public static readonly SEARCH_TERMS: string[] = ['sku', 'variant.title', 'variantOption.title'];

  @Column({ type: ENUM_COLUMN_TYPES.INT, nullable: false, default: 0 })
  position?: number;

  @Column({ length: 256, type: ENUM_COLUMN_TYPES.VARCHAR, nullable: true })
  sku?: string;

  @Column({ type: ENUM_COLUMN_TYPES.FLOAT, nullable: false, default: 0 })
  sellingPrice?: number;

  @Column({ type: ENUM_COLUMN_TYPES.INT, nullable: false, default: 0 })
  stockQuantity?: number;

  @Column({ type: ENUM_COLUMN_TYPES.INT, nullable: false, default: 0 })
  saleQuantity?: number;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  product?: Product;

  @Index()
  @RelationId((e: ProductVariantOption) => e.product)
  @Column({ nullable: false })
  productId?: string;

  @ManyToOne(() => Variant, { onDelete: 'CASCADE' })
  variant?: Variant;

  @Index()
  @RelationId((e: ProductVariantOption) => e.variant)
  @Column({ nullable: false })
  variantId?: string;

  @ManyToOne(() => VariantOption, { onDelete: 'CASCADE' })
  variantOption?: VariantOption;

  @Index()
  @RelationId((e: ProductVariantOption) => e.variantOption)
  @Column({ nullable: false })
  variantOptionId?: string;
}
