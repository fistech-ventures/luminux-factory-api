import { BaseEntity } from '@src/app/base';
import { ENUM_COLUMN_TYPES, ENUM_TABLE_NAMES } from '@src/shared';
import { Column, Entity } from 'typeorm';

@Entity(ENUM_TABLE_NAMES.PAYMENT_GATEWAYS, { orderBy: { createdAt: 'DESC' } })
export class PaymentGateway extends BaseEntity {
  public static readonly SEARCH_TERMS: string[] = ['title', 'paymentGateway'];

  @Column({
    type: ENUM_COLUMN_TYPES.VARCHAR,
    nullable: true,
  })
  title?: string;

  @Column({
    type: ENUM_COLUMN_TYPES.VARCHAR,
    nullable: true,
  })
  paymentGateway?: string;

  @Column({
    type: ENUM_COLUMN_TYPES.VARCHAR,
    nullable: true,
  })
  description?: string;

  @Column({
    type: ENUM_COLUMN_TYPES.VARCHAR,
    nullable: true,
  })
  image?: string;

  @Column({ type: ENUM_COLUMN_TYPES.BOOLEAN, default: true })
  visibleToPublic?: boolean;
}
