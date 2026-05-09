import { BaseEntity } from '@src/app/base';
import { ENUM_COLUMN_TYPES, ENUM_TABLE_NAMES } from '@src/shared';
import { Type } from 'class-transformer';
import { Column, Entity, Index, ManyToOne, RelationId } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { ENUM_TRANSACTION_STATUS } from '../enums';
import { UserInvoice } from './userInvoice.entity';

@Entity(ENUM_TABLE_NAMES.USER_TRANSACTIONS)
export class UserTransaction extends BaseEntity {
  public static readonly SEARCH_TERMS: string[] = ['code', 'invoiceCode'];

  @Column({
    type: ENUM_COLUMN_TYPES.VARCHAR,
    nullable: false,
    unique: true,
  })
  code?: string;

  @Column({
    type: ENUM_COLUMN_TYPES.VARCHAR,
    nullable: false,
  })
  invoiceCode?: string;

  @Column({
    type: ENUM_COLUMN_TYPES.VARCHAR,
    nullable: true,
  })
  gatewayTxnId?: string;

  @Column({
    type: ENUM_COLUMN_TYPES.FLOAT,
    nullable: true,
    default: 0.0,
  })
  amount?: number;

  @Column({
    type: ENUM_COLUMN_TYPES.VARCHAR,
    nullable: true,
  })
  paymentGateway?: string;

  @Column({
    type: ENUM_COLUMN_TYPES.VARCHAR,
    nullable: true,
  })
  paymentMethod?: string;

  @Column({
    type: ENUM_COLUMN_TYPES.VARCHAR,
    nullable: true,
  })
  paymentIssuer?: string;

  @Column({
    type: ENUM_COLUMN_TYPES.VARCHAR,
    nullable: true,
  })
  paymentCurrency?: string;

  @Column({
    type: ENUM_COLUMN_TYPES.TEXT,
    nullable: true,
  })
  note?: string;

  @Column({
    type: ENUM_COLUMN_TYPES.TIMESTAMP_UTC,
    nullable: true,
  })
  transactionTime?: Date;

  @Column({
    type: ENUM_COLUMN_TYPES.TIMESTAMP_UTC,
    nullable: true,
  })
  settledAt?: Date;

  @Column({
    type: ENUM_COLUMN_TYPES.VARCHAR,
    nullable: true,
    default: ENUM_TRANSACTION_STATUS.PENDING,
    comment: Object.values(ENUM_TRANSACTION_STATUS).join(', '),
  })
  status?: string;

  @Column({
    type: ENUM_COLUMN_TYPES.TEXT,
    nullable: true,
  })
  reason?: string;

  @Column({
    type: ENUM_COLUMN_TYPES.BOOLEAN,
    nullable: true,
    default: false,
  })
  isForTest?: boolean;

  @ManyToOne(() => User, { onDelete: 'NO ACTION' })
  @Type(() => User)
  user?: User;

  @Index()
  @RelationId((e: UserTransaction) => e.user)
  @Column({ nullable: false })
  userId?: string;

  @ManyToOne(() => User, { onDelete: 'NO ACTION' })
  @Type(() => User)
  transactionBy?: User;

  @Index()
  @RelationId((e: UserTransaction) => e.transactionBy)
  @Column({ nullable: true })
  transactionById?: string;

  @ManyToOne(() => UserInvoice, { onDelete: 'CASCADE' })
  @Type(() => UserInvoice)
  userInvoice?: UserInvoice;

  @Index()
  @RelationId((e: UserTransaction) => e.userInvoice)
  @Column({ nullable: false })
  userInvoiceId?: string;
}
