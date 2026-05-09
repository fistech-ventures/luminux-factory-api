import { BaseEntity } from '@src/app/base';
import { ENUM_COLUMN_TYPES, ENUM_TABLE_NAMES } from '@src/shared';
import { Column, Entity } from 'typeorm';

@Entity(ENUM_TABLE_NAMES.FEEDBACKS, { orderBy: { priority: 'ASC' } })
export class Feedback extends BaseEntity {
  public static readonly SEARCH_TERMS: string[] = ['title'];

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, nullable: true })
  title?: string;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, nullable: true })
  panel?: string;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, nullable: true })
  module?: string;

  @Column({ type: ENUM_COLUMN_TYPES.TEXT, nullable: true })
  description?: string;

  @Column({ type: ENUM_COLUMN_TYPES.JSONB, nullable: true, default: [] })
  attachments?: any;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 25, nullable: true, default: 0 })
  priority?: string;
}
