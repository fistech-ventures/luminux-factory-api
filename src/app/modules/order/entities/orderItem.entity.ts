import { BaseEntity } from '@src/app/base';
import { ENUM_COLUMN_TYPES, ENUM_TABLE_NAMES } from '@src/shared';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { Order } from './order.entity';

@Entity(ENUM_TABLE_NAMES.ORDER_ITEMS, { orderBy: { createdAt: 'DESC' } })
export class OrderItem extends BaseEntity {
  public static readonly SEARCH_TERMS: string[] = ['code'];

  // TODO: Add offerId field to link applied special offers
  // @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, nullable: true })
  // offerId?: string;

  @Column({ type: ENUM_COLUMN_TYPES.INT, nullable: false, default: 1 })
  quantity?: number;

  @Column({ type: ENUM_COLUMN_TYPES.JSONB, nullable: false })
  product?: any;

  @Column({ nullable: false })
  productId?: string;

  @Column({ type: ENUM_COLUMN_TYPES.JSONB, nullable: true })
  productVariant?: any;

  @Column({ nullable: true })
  productVariantId?: string;

  @ManyToOne(() => Order, { onDelete: 'CASCADE' })
  order?: Order;

  @RelationId((e: OrderItem) => e.order)
  @Column({ nullable: false })
  orderId?: string;
}
