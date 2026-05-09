import { BaseEntity } from '@src/app/base';
import { ENUM_COLUMN_TYPES, ENUM_TABLE_NAMES } from '@src/shared';
import { Column, Entity, Index } from 'typeorm';

@Entity(ENUM_TABLE_NAMES.BRANDS)
export class Brand extends BaseEntity {
  public static readonly SEARCH_TERMS: string[] = ['title'];
  @Index()
  @Column({ length: 256, type: ENUM_COLUMN_TYPES.VARCHAR, nullable: false, unique: true })
  title?: string;

  @Column({ type: ENUM_COLUMN_TYPES.TEXT, nullable: true })
  logo?: string;

  @Column({ type: ENUM_COLUMN_TYPES.TEXT, nullable: true })
  banner?: string;
}