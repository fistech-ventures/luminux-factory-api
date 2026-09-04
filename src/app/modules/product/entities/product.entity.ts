import { BaseEntity } from '@src/app/base';
import { ENUM_COLUMN_TYPES, ENUM_TABLE_NAMES } from '@src/shared';
import { Column, Entity, Index, OneToMany } from 'typeorm';
import { ProductVariantOption } from './productVariantOption.entity';

@Entity(ENUM_TABLE_NAMES.PRODUCTS, { orderBy: { createdAt: 'DESC' } })
export class Product extends BaseEntity {
  public static readonly SEARCH_TERMS: string[] = ['title', 'description', 'productCode'];

  @Index()
  @Column({ length: 255, type: ENUM_COLUMN_TYPES.VARCHAR, nullable: false })
  title?: string;

  @Column({ type: ENUM_COLUMN_TYPES.TEXT, nullable: true })
  description?: string;

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

  @OneToMany(() => ProductVariantOption, (variant) => variant.product, { cascade: true })
  variants?: ProductVariantOption[];
}
