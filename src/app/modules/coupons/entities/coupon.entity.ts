import { BaseEntity } from '@src/app/base';
import { ENUM_COLUMN_TYPES, ENUM_TABLE_NAMES } from '@src/shared';
import { Column, Entity, OneToMany } from 'typeorm';
import { CouponUsage } from './coupon-usage.entity';

@Entity(ENUM_TABLE_NAMES.COUPONS, { orderBy: { createdAt: 'DESC' } })
export class Coupon extends BaseEntity {
  public static readonly SEARCH_TERMS: string[] = ['code'];

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, nullable: false, unique: true })
  code?: string;

  @Column({ type: ENUM_COLUMN_TYPES.TEXT, nullable: true })
  description?: string;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, nullable: false })
  discountType?: string;

  @Column({ type: ENUM_COLUMN_TYPES.INT, nullable: false })
  discountValue?: number;

  @Column({ type: ENUM_COLUMN_TYPES.INT, nullable: true })
  maxDiscountCap?: number;

  @Column({ type: ENUM_COLUMN_TYPES.INT, nullable: true })
  minOrderAmount?: number;

  @Column({ type: ENUM_COLUMN_TYPES.TIMESTAMP_UTC, nullable: false })
  startsAt?: Date;

  @Column({ type: ENUM_COLUMN_TYPES.TIMESTAMP_UTC, nullable: false })
  endsAt?: Date;

  @Column({ type: ENUM_COLUMN_TYPES.BOOLEAN, nullable: false, default: true })
  isActive?: boolean;

  @Column({ type: ENUM_COLUMN_TYPES.INT, nullable: true })
  maxUsageCount?: number;

  @Column({ type: ENUM_COLUMN_TYPES.INT, nullable: false, default: 0 })
  currentUsageCount?: number;

  @Column({ type: ENUM_COLUMN_TYPES.INT, nullable: true })
  maxUsagePerUser?: number;

  @OneToMany(() => CouponUsage, (usage) => usage.coupon, { cascade: true })
  usages?: CouponUsage[];
}
