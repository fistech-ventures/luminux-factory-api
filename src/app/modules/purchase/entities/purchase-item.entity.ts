import { BaseEntity } from '@src/app/base';
import { ENUM_COLUMN_TYPES, ENUM_TABLE_NAMES } from '@src/shared';
import { Column, Entity, Index, ManyToOne, RelationId } from 'typeorm';
import { Purchase } from './purchase.entity';
import { Product } from '../../product/entities/product.entity';
import { ProductVariantOption } from '../../product/entities/productVariantOption.entity';

@Entity(ENUM_TABLE_NAMES.PURCHASE_ITEMS, { orderBy: { createdAt: 'DESC' } })
export class PurchaseItem extends BaseEntity {
  @ManyToOne(() => Purchase, { onDelete: 'CASCADE' })
  purchase?: Purchase;

  @Index()
  @RelationId((item: PurchaseItem) => item.purchase)
  @Column({ nullable: false })
  purchaseId?: string;

  @ManyToOne(() => Product, { onDelete: 'SET NULL', nullable: true })
  product?: Product;

  @Index()
  @RelationId((item: PurchaseItem) => item.product)
  @Column({ nullable: true })
  productId?: string;

  @ManyToOne(() => ProductVariantOption, { onDelete: 'SET NULL', nullable: true })
  variant?: ProductVariantOption;

  @Index()
  @RelationId((item: PurchaseItem) => item.variant)
  @Column({ nullable: true })
  variantId?: string;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 255, nullable: true })
  productName?: string;

  @Column({ type: ENUM_COLUMN_TYPES.INT, nullable: false })
  quantity?: number;

  @Column({ type: ENUM_COLUMN_TYPES.FLOAT, nullable: false })
  totalProductCost?: number;

  @Column({ type: ENUM_COLUMN_TYPES.FLOAT, nullable: false, default: 0 })
  otherCost?: number;

  @Column({ type: ENUM_COLUMN_TYPES.FLOAT, nullable: false })
  calculatedSourcingPrice?: number;
}
