import { BaseEntity } from '@src/app/base';
import { ENUM_COLUMN_TYPES, ENUM_TABLE_NAMES } from '@src/shared';
import { ENUM_PAYMENT_STATUS } from '@src/shared/enums/common.enums';
import { Type } from 'class-transformer';
import { Column, Entity, Index, ManyToOne, RelationId } from 'typeorm';
import { Order } from '../../order/entities/order.entity';
import { User } from '../../user/entities/user.entity';

@Entity(ENUM_TABLE_NAMES.USER_INVOICES, { orderBy: { createdAt: 'DESC' } })
export class UserInvoice extends BaseEntity {
  public static readonly SEARCH_TERMS: string[] = ['code'];

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 20, nullable: false, unique: true })
  code?: string;

  @Column({
    type: ENUM_COLUMN_TYPES.VARCHAR,
    length: 30,
    nullable: false,
    default: ENUM_PAYMENT_STATUS.UNPAID,
  })
  paymentStatus?: string;

  @Column({ type: ENUM_COLUMN_TYPES.TEXT, nullable: true })
  pdfLink?: string;

  @Column({ type: ENUM_COLUMN_TYPES.FLOAT, nullable: true, default: 0 })
  billedAmount?: number;

  @Column({ type: ENUM_COLUMN_TYPES.FLOAT, nullable: true, default: 0 })
  amount?: number;

  @Column({ type: ENUM_COLUMN_TYPES.FLOAT, nullable: true, default: 0 })
  previousDue?: number;

  @ManyToOne(() => Order, { onDelete: 'CASCADE' })
  @Type(() => Order)
  order?: Order;

  @Index()
  @RelationId((e: UserInvoice) => e.order)
  @Column({ nullable: true })
  orderId?: string;

  @ManyToOne(() => User, { onDelete: 'NO ACTION' })
  @Type(() => User)
  user?: User;

  @Index()
  @RelationId((e: UserInvoice) => e.user)
  @Column({ nullable: false })
  userId?: string;

  @Column({ type: ENUM_COLUMN_TYPES.TIMESTAMP_UTC, nullable: true })
  paidAt?: Date;
}
