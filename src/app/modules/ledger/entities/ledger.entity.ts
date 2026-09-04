import { BaseEntity } from '@src/app/base';
import { ENUM_COLUMN_TYPES, ENUM_TABLE_NAMES } from '@src/shared';
import { Column, Entity } from 'typeorm';

@Entity(ENUM_TABLE_NAMES.LEDGERS, { orderBy: { createdAt: 'DESC' } })
export class Ledger extends BaseEntity {
  public static readonly SEARCH_TERMS: string[] = ['description'];
  public static readonly DATE_FILTER_COLUMN: string = 'transactionDate';

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 50, nullable: false })
  entityType?: string;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 255, nullable: false })
  entityId?: string;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 50, nullable: false })
  type?: string;

  @Column({ type: ENUM_COLUMN_TYPES.FLOAT, nullable: false })
  amount?: number;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 255, nullable: true })
  referenceId?: string;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 50, nullable: true })
  referenceType?: string;

  @Column({ type: ENUM_COLUMN_TYPES.TEXT, nullable: true })
  description?: string;

  @Column({ type: ENUM_COLUMN_TYPES.DATE, nullable: false })
  transactionDate?: Date;
}
