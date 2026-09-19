import { BaseEntity } from '@src/app/base';
import { ENUM_COLUMN_TYPES, ENUM_PAYMENT_METHODS, ENUM_TABLE_NAMES } from '@src/shared';
import { Column, Entity, Index, ManyToOne, OneToMany, RelationId } from 'typeorm';
import { Customer } from '../../customer/entities/customer.entity';
import { User } from '../../user/entities/user.entity';
import { SaleItem } from './sale-item.entity';

@Entity(ENUM_TABLE_NAMES.SALES, { orderBy: { createdAt: 'DESC' } })
export class Sale extends BaseEntity {
  public static readonly DATE_FILTER_COLUMN: string = 'date';

  @Column({ type: ENUM_COLUMN_TYPES.DATE, nullable: false })
  date?: Date;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 50, nullable: true, unique: true })
  invoiceNo?: string;

  @Column({ type: ENUM_COLUMN_TYPES.TEXT, nullable: true })
  invoiceUrl?: string;

  @ManyToOne(() => Customer, { onDelete: 'RESTRICT' })
  customer?: Customer;

  @Index()
  @RelationId((sale: Sale) => sale.customer)
  @Column({ nullable: false })
  customerId?: string;

  @OneToMany(() => SaleItem, (item) => item.sale)
  items?: SaleItem[];

  @Column({ type: ENUM_COLUMN_TYPES.FLOAT, nullable: false, default: 0 })
  totalAmount?: number;

  @Column({ type: ENUM_COLUMN_TYPES.FLOAT, nullable: false, default: 0 })
  discount?: number;

  @Column({ type: ENUM_COLUMN_TYPES.FLOAT, nullable: false, default: 0 })
  grandTotal?: number;

  @Column({ type: ENUM_COLUMN_TYPES.FLOAT, nullable: false, default: 0 })
  paidAmount?: number;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 100, nullable: false })
  paymentMethod?: ENUM_PAYMENT_METHODS;

  @Column({ type: ENUM_COLUMN_TYPES.FLOAT, nullable: false, default: 0 })
  dueAmount?: number;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, nullable: false })
  shippingTo?: string;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, nullable: true })
  shippingAddress?: string;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, nullable: true })
  shippingContact?: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  soldBy?: User;

  @Index()
  @RelationId((sale: Sale) => sale.soldBy)
  @Column({ nullable: false })
  soldById?: string;
}
