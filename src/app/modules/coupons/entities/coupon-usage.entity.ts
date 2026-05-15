import { BaseEntity } from '@src/app/base';
import { ENUM_COLUMN_TYPES, ENUM_TABLE_NAMES } from '@src/shared';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { Coupon } from './coupon.entity';
import { Order } from '../../order/entities/order.entity';
import { User } from '../../user/entities/user.entity';

@Entity(ENUM_TABLE_NAMES.COUPON_USAGES, { orderBy: { createdAt: 'DESC' } })
export class CouponUsage extends BaseEntity {
  public static readonly SEARCH_TERMS: string[] = [];

  @ManyToOne(() => Coupon, { onDelete: 'CASCADE' })
  coupon?: Coupon;

  @RelationId((usage: CouponUsage) => usage.coupon)
  @Column({ nullable: false })
  couponId?: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  user?: User;

  @RelationId((usage: CouponUsage) => usage.user)
  @Column({ nullable: true })
  userId?: string;

  @ManyToOne(() => Order, { onDelete: 'SET NULL' })
  order?: Order;

  @RelationId((usage: CouponUsage) => usage.order)
  @Column({ nullable: true })
  orderId?: string;

  @Column({ type: ENUM_COLUMN_TYPES.TIMESTAMP_UTC, nullable: false, default: () => 'NOW()' })
  usedAt?: Date;

  @Column({ type: ENUM_COLUMN_TYPES.INT, nullable: false })
  discountAmount?: number;
}
