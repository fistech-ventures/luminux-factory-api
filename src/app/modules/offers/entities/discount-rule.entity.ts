import { BaseEntity } from '@src/app/base';
import { ENUM_COLUMN_TYPES, ENUM_TABLE_NAMES } from '@src/shared';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { Offer } from './offer.entity';

@Entity(ENUM_TABLE_NAMES.DISCOUNT_RULES, { orderBy: { createdAt: 'DESC' } })
export class DiscountRule extends BaseEntity {
  public static readonly SEARCH_TERMS: string[] = [];

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, nullable: false })
  type?: string;

  @Column({ type: ENUM_COLUMN_TYPES.INT, nullable: true })
  discountValue?: number;

  @Column({ type: ENUM_COLUMN_TYPES.INT, nullable: true })
  buyQuantity?: number;

  @Column({ type: ENUM_COLUMN_TYPES.INT, nullable: true })
  getQuantity?: number;

  @Column({ type: ENUM_COLUMN_TYPES.INT, nullable: true })
  getPercentage?: number;

  @Column({ type: ENUM_COLUMN_TYPES.INT, nullable: true })
  maxDiscountCap?: number;

  @Column({ type: ENUM_COLUMN_TYPES.INT, nullable: true })
  minOrderAmount?: number;

  @ManyToOne(() => Offer, { onDelete: 'CASCADE' })
  offer?: Offer;

  @RelationId((rule: DiscountRule) => rule.offer)
  @Column({ nullable: false })
  offerId?: string;
}
