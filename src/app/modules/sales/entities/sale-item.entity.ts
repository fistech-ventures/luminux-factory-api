import { BaseEntity } from '@src/app/base';
import { ENUM_COLUMN_TYPES, ENUM_TABLE_NAMES } from '@src/shared';
import { Column, Entity, Index, ManyToOne, RelationId } from 'typeorm';
import { Sale } from './sale.entity';
import { Product } from '../../product/entities/product.entity';
import { ProductVariantOption } from '../../product/entities/productVariantOption.entity';

@Entity(ENUM_TABLE_NAMES.SALE_ITEMS, { orderBy: { createdAt: 'DESC' } })
export class SaleItem extends BaseEntity {
  @ManyToOne(() => Sale, { onDelete: 'CASCADE' })
  sale?: Sale;

  @Index()
  @RelationId((item: SaleItem) => item.sale)
  @Column({ nullable: false })
  saleId?: string;

  @ManyToOne(() => Product, { onDelete: 'RESTRICT' })
  product?: Product;

  @Index()
  @RelationId((item: SaleItem) => item.product)
  @Column({ nullable: false })
  productId?: string;

  @ManyToOne(() => ProductVariantOption, { onDelete: 'RESTRICT' })
  variant?: ProductVariantOption;

  @Index()
  @RelationId((item: SaleItem) => item.variant)
  @Column({ nullable: true })
  variantId?: string;

  @Column({ type: ENUM_COLUMN_TYPES.INT, nullable: false })
  quantity?: number;

  @Column({ type: ENUM_COLUMN_TYPES.FLOAT, nullable: false })
  sellingPrice?: number;

  @Column({ type: ENUM_COLUMN_TYPES.FLOAT, nullable: false })
  totalAmount?: number;
}
