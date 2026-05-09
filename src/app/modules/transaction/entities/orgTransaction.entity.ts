import { BaseEntity } from '@src/app/base';
import { ENUM_COLUMN_TYPES, ENUM_TABLE_NAMES } from '@src/shared';
import { Type } from 'class-transformer';
import { Column, Entity, Index, ManyToOne, RelationId } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { ENUM_TRANSACTION_STATUS } from '../enums';

@Entity(ENUM_TABLE_NAMES.ORG_TRANSACTIONS)
export class OrgTransaction extends BaseEntity {
  public static readonly SEARCH_TERMS: string[] = ['code', 'invoiceCode'];

  @Column({
    type: ENUM_COLUMN_TYPES.VARCHAR,
    nullable: false,
    unique: true,
  })
  code?: string;

  @Column({
    type: ENUM_COLUMN_TYPES.TEXT,
    nullable: true,
  })
  cause?: string;

  @Column({
    type: ENUM_COLUMN_TYPES.FLOAT,
    nullable: true,
    default: 0.0,
  })
  amount?: number;

  @Column({
    type: ENUM_COLUMN_TYPES.VARCHAR,
    nullable: false,
  })
  invoiceCode?: string;

  @Column({
    type: ENUM_COLUMN_TYPES.VARCHAR,
    nullable: false,
  })
  orderCode?: string;

  @Column({
    type: ENUM_COLUMN_TYPES.VARCHAR,
    nullable: true,
  })
  paymentGateway?: string;

  @Column({
    type: ENUM_COLUMN_TYPES.VARCHAR,
    nullable: true,
  })
  paymentAccount?: string;

  @Column({
    type: ENUM_COLUMN_TYPES.VARCHAR,
    length: 100,
    nullable: true,
  })
  txnSource?: string;

  @Column({
    type: ENUM_COLUMN_TYPES.VARCHAR,
    length: 100,
    nullable: true,
  })
  txnCode?: string;

  @Column({
    type: ENUM_COLUMN_TYPES.TEXT,
    nullable: true,
  })
  paymentNote?: string;

  @Column({
    type: ENUM_COLUMN_TYPES.TIMESTAMP_UTC,
    nullable: true,
  })
  transactionTime?: Date;

  @Column({
    type: ENUM_COLUMN_TYPES.VARCHAR,
    nullable: true,
    default: ENUM_TRANSACTION_STATUS.PENDING,
    comment: Object.values(ENUM_TRANSACTION_STATUS).join(', '),
  })
  status?: string;

  @Column({
    type: ENUM_COLUMN_TYPES.BOOLEAN,
    nullable: true,
    default: false,
  })
  isForTest?: boolean;

  @ManyToOne(() => User, { onDelete: 'NO ACTION' })
  @Type(() => User)
  transactionBy?: User;

  @Index()
  @RelationId((e: OrgTransaction) => e.transactionBy)
  @Column({ nullable: false })
  transactionById?: string;
}
