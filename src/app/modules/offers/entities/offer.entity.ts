import { BaseEntity } from '@src/app/base';
import { ENUM_COLUMN_TYPES, ENUM_TABLE_NAMES } from '@src/shared';
import { Column, Entity, OneToMany } from 'typeorm';
import { DiscountRule } from './discount-rule.entity';
import { OfferScope } from './offer-scope.entity';

@Entity(ENUM_TABLE_NAMES.OFFERS, { orderBy: { createdAt: 'DESC' } })
export class Offer extends BaseEntity {
  public static readonly SEARCH_TERMS: string[] = ['name'];

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, nullable: false })
  name?: string;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, nullable: true, unique: true })
  slug?: string;

  @Column({ type: ENUM_COLUMN_TYPES.TEXT, nullable: true })
  banner?: string;

  @Column({ type: ENUM_COLUMN_TYPES.TEXT, nullable: true })
  description?: string;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, nullable: true })
  tag?: string;

  @Column({ type: ENUM_COLUMN_TYPES.TIMESTAMP_UTC, nullable: false })
  startsAt?: Date;

  @Column({ type: ENUM_COLUMN_TYPES.TIMESTAMP_UTC, nullable: false })
  endsAt?: Date;

  @Column({ type: ENUM_COLUMN_TYPES.BOOLEAN, nullable: false, default: true })
  isActive?: boolean;

  @Column({ type: ENUM_COLUMN_TYPES.INT, nullable: false, default: 0 })
  priority?: number;

  @OneToMany(() => DiscountRule, (rule) => rule.offer, { cascade: true })
  rules?: DiscountRule[];

  @OneToMany(() => OfferScope, (scope) => scope.offer, { cascade: true })
  scopes?: OfferScope[];
}
