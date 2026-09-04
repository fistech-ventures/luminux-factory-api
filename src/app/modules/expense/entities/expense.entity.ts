import { BaseEntity } from '@src/app/base';
import { ENUM_COLUMN_TYPES, ENUM_TABLE_NAMES } from '@src/shared';
import { Column, Entity } from 'typeorm';

@Entity(ENUM_TABLE_NAMES.EXPENSES, { orderBy: { createdAt: 'DESC' } })
export class Expense extends BaseEntity {
  public static readonly SEARCH_TERMS: string[] = ['purpose'];
  public static readonly DATE_FILTER_COLUMN: string = 'date';

  @Column({ type: ENUM_COLUMN_TYPES.DATE, nullable: false })
  date?: Date;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 255, nullable: false })
  purpose?: string;

  @Column({ type: ENUM_COLUMN_TYPES.FLOAT, nullable: false })
  amountSpent?: number;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 255, nullable: false })
  spentBy?: string;
}
