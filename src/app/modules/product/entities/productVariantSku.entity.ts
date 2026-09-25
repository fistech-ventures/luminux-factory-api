import { BaseEntity } from '@src/app/base';
import { ENUM_COLUMN_TYPES, ENUM_TABLE_NAMES } from '@src/shared';
import { Column, Entity, Index, ManyToOne, OneToMany, RelationId } from 'typeorm';
import { Product } from './product.entity';
import { ProductVariantSkuValue } from './productVariantSkuValue.entity';

@Entity(ENUM_TABLE_NAMES.PRODUCT_VARIANT_SKUS, { orderBy: { createdAt: 'DESC' } })
export class ProductVariantSku extends BaseEntity {

  @Column({ length: 255, type: ENUM_COLUMN_TYPES.VARCHAR, nullable: true })
  name?: string;

  @Column({ length: 50, type: ENUM_COLUMN_TYPES.VARCHAR, nullable: true })
  unit?: string;

  @Index({ unique: true })
  @Column({ length: 100, type: ENUM_COLUMN_TYPES.VARCHAR, nullable: false, unique: true })
  productCode?: string;

  @Column({ type: ENUM_COLUMN_TYPES.FLOAT, nullable: false, default: 0 })
  sourcingPrice?: number;

  @Column({ type: ENUM_COLUMN_TYPES.FLOAT, nullable: false, default: 0 })
  sellingPrice?: number;

  @Column({ type: ENUM_COLUMN_TYPES.INT, nullable: false, default: 0 })
  stockQuantity?: number;

  @Column({ type: ENUM_COLUMN_TYPES.INT, nullable: false, default: 0 })
  saleQuantity?: number;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  product?: Product;

  @Index()
  @RelationId((sku: ProductVariantSku) => sku.product)
  @Column({ nullable: false })
  productId?: string;

  @OneToMany(() => ProductVariantSkuValue, (value) => value.sku, { cascade: true })
  values?: ProductVariantSkuValue[];
}