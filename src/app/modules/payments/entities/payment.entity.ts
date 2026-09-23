import { BaseEntity } from '@src/app/base';
import { ENUM_COLUMN_TYPES, ENUM_PAYMENT_METHODS, ENUM_TABLE_NAMES } from '@src/shared';
import { Column, Entity } from 'typeorm';

@Entity(ENUM_TABLE_NAMES.PAYMENTS, { orderBy: { createdAt: 'DESC' } })
export class Payment extends BaseEntity {
  public static readonly SEARCH_TERMS: string[] = ['note'];
  public static readonly DATE_FILTER_COLUMN: string = 'paymentDate';

  @Column({ type: ENUM_COLUMN_TYPES.DATE, nullable: false })
  paymentDate?: Date;

  // 'customer' => collection from customer (money in)
  // 'supplier' => payment to supplier (money out)
  // 'employee' => advance / expense money handed to an employee (money out)
  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 50, nullable: false })
  entityType?: string;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 255, nullable: false })
  entityId?: string;

  @Column({ type: ENUM_COLUMN_TYPES.FLOAT, nullable: false })
  amount?: number;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 100, nullable: false })
  paymentMethod?: ENUM_PAYMENT_METHODS;

  // Optional link back to the sale/purchase this payment settles.
  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 255, nullable: true })
  referenceId?: string;

  // 'sale' | 'purchase'
  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 50, nullable: true })
  referenceType?: string;

  @Column({ type: ENUM_COLUMN_TYPES.TEXT, nullable: true })
  note?: string;
}