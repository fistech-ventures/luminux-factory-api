import { BaseEntity } from '@src/app/base';
import { ENUM_COLUMN_TYPES, ENUM_TABLE_NAMES } from '@src/shared';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { ENUM_CUSTOMER_ORDER_STATUS, ENUM_INTERNAL_ORDER_STATUS } from '../const';
import { Order } from './order.entity';

@Entity(ENUM_TABLE_NAMES.ORDER_STATUSES, { orderBy: { createdAt: 'DESC' } })
export class OrderStatus extends BaseEntity {
  public static readonly SEARCH_TERMS: string[] = ['code'];

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 250, nullable: false, default: ENUM_INTERNAL_ORDER_STATUS.PENDING })
  operationalStatus?: string;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 250, nullable: false, default: ENUM_CUSTOMER_ORDER_STATUS.PENDING })
  status?: string;

  @Column({ type: 'text', nullable: true })
  note?: string;

  @ManyToOne(() => Order, { onDelete: 'CASCADE' })
  order?: Order;

  @RelationId((e: OrderStatus) => e.order)
  @Column({ nullable: false })
  orderId?: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  changedBy?: User;

  @RelationId((e: OrderStatus) => e.changedBy)
  @Column({ nullable: false })
  changedById?: string;
}
