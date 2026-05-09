import { BaseEntity } from '@src/app/base';
import { ENUM_COLUMN_TYPES, ENUM_TABLE_NAMES } from '@src/shared';
import { Column, Entity } from 'typeorm';

@Entity(ENUM_TABLE_NAMES.TRANSACTION_SOURCES)
export class TransactionSource extends BaseEntity {
  public static readonly SEARCH_TERMS: string[] = ['title'];
  @Column({
    type: ENUM_COLUMN_TYPES.VARCHAR,
    nullable: false,
    unique: true,
  })
  title?: string;
}
