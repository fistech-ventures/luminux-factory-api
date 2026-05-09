import { BaseEntity } from '@src/app/base';
import { ENUM_COLUMN_TYPES, ENUM_TABLE_NAMES } from '@src/shared';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { PaymentGateway } from './paymentGateway.entity';

@Entity(ENUM_TABLE_NAMES.PAYMENT_ACCOUNTS, { orderBy: { createdAt: 'DESC' } })
export class PaymentAccount extends BaseEntity {
  public static readonly SEARCH_TERMS: string[] = [];
  @Column({
    type: ENUM_COLUMN_TYPES.VARCHAR,
    nullable: true,
  })
  title?: string;

  @Column({ type: ENUM_COLUMN_TYPES.BOOLEAN, default: false })
  isDefault?: boolean;

  @Column({ length: 256, type: ENUM_COLUMN_TYPES.VARCHAR, nullable: false })
  accountHolder?: string;

  @Column({ length: 256, type: ENUM_COLUMN_TYPES.VARCHAR, nullable: false })
  accountNo?: string;

  @Column({ length: 256, type: ENUM_COLUMN_TYPES.VARCHAR, nullable: false })
  accountType?: string;

  @Column({ type: ENUM_COLUMN_TYPES.FLOAT, nullable: false, default: 0.0 })
  currentBalance?: number;

  @ManyToOne(() => PaymentGateway, { onDelete: 'CASCADE' })
  gateway?: PaymentGateway;

  @RelationId((e: PaymentAccount) => e.gateway)
  @Column({ nullable: true })
  gatewayId?: string;
}
