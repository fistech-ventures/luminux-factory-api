import { BaseEntity } from '@src/app/base/base.entity';
import { ENUM_COLUMN_TYPES, ENUM_TABLE_NAMES } from '@src/shared';
import { Column, Entity, Index, ManyToOne, RelationId } from 'typeorm';
import { UserInvoice } from '../../transaction/entities/userInvoice.entity';
import { User } from '../../user/entities/user.entity';

@Entity(ENUM_TABLE_NAMES.PAYMENT_GATEWAY_LOGS, { orderBy: { createdAt: 'DESC' } })
export class PaymentGatewayLog extends BaseEntity {
  @Column({ nullable: true, type: ENUM_COLUMN_TYPES.FLOAT })
  amount?: number;

  @Column({ nullable: true, type: ENUM_COLUMN_TYPES.FLOAT, default: 0.0 })
  discountAmount?: number;

  @Column({ nullable: true, type: ENUM_COLUMN_TYPES.TEXT })
  code?: string;

  @Column({ nullable: true, type: ENUM_COLUMN_TYPES.TEXT })
  transactionCode?: string;

  @Column({ nullable: true, type: ENUM_COLUMN_TYPES.TEXT })
  invoiceId?: string;

  @Column({ nullable: true, type: ENUM_COLUMN_TYPES.TEXT })
  invoiceCode?: string;

  @Column({ nullable: true, type: ENUM_COLUMN_TYPES.TEXT })
  transactionMethod?: string;

  @Column({ nullable: true, type: ENUM_COLUMN_TYPES.TEXT })
  transactionId?: string;

  @Column({ nullable: true, type: ENUM_COLUMN_TYPES.TIMESTAMP_UTC })
  transactionTime?: Date;

  @Column({ nullable: true, type: ENUM_COLUMN_TYPES.TEXT })
  reason?: string;

  @Column({ nullable: true, type: ENUM_COLUMN_TYPES.TEXT })
  paymentIssuer?: string;

  @Column({ nullable: true, type: ENUM_COLUMN_TYPES.TEXT })
  paymentGateway?: string;

  @Column({ nullable: true, type: ENUM_COLUMN_TYPES.TEXT })
  originUrl?: string;

  @Column({ nullable: true, type: ENUM_COLUMN_TYPES.TEXT })
  webCallbackUrl?: string;

  @Column({ nullable: true, type: ENUM_COLUMN_TYPES.TEXT })
  paymentMethod?: string;

  @Column({ nullable: true, type: ENUM_COLUMN_TYPES.TEXT })
  paymentCurrency?: string;

  @Column({ nullable: true, type: ENUM_COLUMN_TYPES.JSONB })
  paymentGatewayOriginalResponse?: any;

  @Column({ nullable: true, type: ENUM_COLUMN_TYPES.JSONB })
  paymentGatewayRequestResponse?: any;

  @Column({ nullable: true, type: ENUM_COLUMN_TYPES.JSONB })
  paymentGatewayRequestPayload?: any;

  @Column({ nullable: true, default: false })
  isSuccess?: boolean;

  @Column({ nullable: true, type: ENUM_COLUMN_TYPES.VARCHAR })
  status?: string;

  @Column({ nullable: true, type: ENUM_COLUMN_TYPES.VARCHAR })
  paymentFor?: string;

  @Column({
    type: ENUM_COLUMN_TYPES.BOOLEAN,
    nullable: true,
    default: false,
  })
  isApproved?: boolean;

  @Column({
    type: ENUM_COLUMN_TYPES.TIMESTAMP_UTC,
    nullable: true,
  })
  approvedAt?: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user?: User;

  @Index()
  @RelationId((e: PaymentGatewayLog) => e.user)
  @Column({ nullable: true })
  userId?: string;

  @ManyToOne(() => UserInvoice, { onDelete: 'CASCADE' })
  userInvoice?: UserInvoice;

  @Index()
  @RelationId((e: PaymentGatewayLog) => e.userInvoice)
  @Column({ nullable: false })
  userInvoiceId?: string;
}
