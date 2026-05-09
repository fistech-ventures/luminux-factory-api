import { BaseEntity } from '@src/app/base';
import { ENUM_COLUMN_TYPES, ENUM_TABLE_NAMES } from '@src/shared';
import { Column, Entity } from 'typeorm';
import { ENUM_CAMPAIGN_FORM_STATUS } from '../enums';

@Entity(ENUM_TABLE_NAMES.FORMS, { orderBy: { createdAt: 'DESC' } })
export class Form extends BaseEntity {
  public static readonly SEARCH_TERMS: string[] = [];

  @Column({ nullable: true, type: ENUM_COLUMN_TYPES.VARCHAR })
  code?: string;

  @Column({ nullable: true, type: ENUM_COLUMN_TYPES.VARCHAR })
  title?: string;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, nullable: true, unique: true })
  slug?: string;

  @Column({ type: ENUM_COLUMN_TYPES.TIMESTAMP_UTC, nullable: true })
  validUntil?: Date;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, nullable: true })
  formType?: string;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, default: ENUM_CAMPAIGN_FORM_STATUS.DRAFTED })
  status?: string;

  @Column({ type: ENUM_COLUMN_TYPES.JSONB, nullable: true })
  formStructure?: any;

  @Column({ type: ENUM_COLUMN_TYPES.INT, default: 0 })
  visitCount?: number;
}
