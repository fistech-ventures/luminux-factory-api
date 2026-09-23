import { BaseEntity } from '@src/app/base';
import { ENUM_COLUMN_TYPES, ENUM_PAYMENT_METHODS, ENUM_TABLE_NAMES } from '@src/shared';
import { Column, Entity } from 'typeorm';

@Entity(ENUM_TABLE_NAMES.EXPENSES, { orderBy: { createdAt: 'DESC' } })
export class Expense extends BaseEntity {
  public static readonly SEARCH_TERMS: string[] = ['purpose', 'spentBy'];
  public static readonly DATE_FILTER_COLUMN: string = 'date';

  @Column({ type: ENUM_COLUMN_TYPES.DATE, nullable: false })
  date?: Date;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 255, nullable: false })
  purpose?: string;

  @Column({ type: ENUM_COLUMN_TYPES.FLOAT, nullable: false })
  amountSpent?: number;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 100, nullable: false })
  paymentMethod?: ENUM_PAYMENT_METHODS;

  // Employee who spent the money out of their advance / petty cash. When set,
  // the expense is settled from the employee's balance and does NOT reduce the
  // company's account balances (the money already left when it was advanced).
  @Column({ type: ENUM_COLUMN_TYPES.PRIMARY_KEY, nullable: true })
  employeeId?: string;

  // Display name of who spent it. Kept for backwards compatibility and
  // auto-filled from the linked employee when employeeId is provided.
  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 255, nullable: true })
  spentBy?: string;
}
