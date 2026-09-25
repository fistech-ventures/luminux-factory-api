import { BaseEntity } from '@src/app/base';
import { ENUM_COLUMN_TYPES, ENUM_TABLE_NAMES } from '@src/shared';
import { Column, Entity, Index, OneToMany } from 'typeorm';
import { ProductVariantOption } from './productVariantOption.entity';
import { ProductVariantSku } from './productVariantSku.entity';

@Entity(ENUM_TABLE_NAMES.PRODUCTS, { orderBy: { createdAt: 'DESC' } })
export class Product extends BaseEntity {
  public static readonly SEARCH_TERMS: string[] = [
    'title',
    'productCode',
    'skus.productCode',
    'skus.values.variantOption.title',
  ];

  @Index()
  @Column({ length: 255, type: ENUM_COLUMN_TYPES.VARCHAR, nullable: false })
  title?: string;

  @Column({ type: ENUM_COLUMN_TYPES.TEXT, nullable: true })
  warranty?: string;

  @Column({ type: ENUM_COLUMN_TYPES.FLOAT, nullable: false, default: 0 })
  sourcingPrice?: number;

  @Column({ type: ENUM_COLUMN_TYPES.FLOAT, nullable: false, default: 0 })
  sellingPrice?: number;

  @Column({ type: ENUM_COLUMN_TYPES.TEXT, nullable: true })
  thumbnail?: string;

  @Index()
  @Column({ length: 100, type: ENUM_COLUMN_TYPES.VARCHAR, nullable: false, unique: true })
  productCode?: string;

  @Column({ type: ENUM_COLUMN_TYPES.INT, nullable: false, default: 0 })
  stock?: number;

  @Column({ type: ENUM_COLUMN_TYPES.INT, nullable: false, default: 0 })
  saleQuantity?: number;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 50, nullable: true })
  unit?: string;

  // Weighted average of the per-unit selling price across B2B / B2C sales.
  // Auto-calculated by the sales module on every sale; not user editable.
  @Column({ type: ENUM_COLUMN_TYPES.FLOAT, nullable: false, default: 0 })
  averageB2BSalesPrice?: number;

  @Column({ type: ENUM_COLUMN_TYPES.FLOAT, nullable: false, default: 0 })
  averageB2CSalesPrice?: number;

  // Quantity sold per customer type - used to keep the averages weighted.
  @Column({ type: ENUM_COLUMN_TYPES.INT, nullable: false, default: 0 })
  b2bSoldQuantity?: number;

  @Column({ type: ENUM_COLUMN_TYPES.INT, nullable: false, default: 0 })
  b2cSoldQuantity?: number;

  @OneToMany(() => ProductVariantOption, (variant) => variant.product, { cascade: true })
  variants?: ProductVariantOption[];

  @OneToMany(() => ProductVariantSku, (sku) => sku.product, { cascade: true })
  skus?: ProductVariantSku[];
}
