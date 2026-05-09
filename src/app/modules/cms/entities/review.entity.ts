import { BaseEntity } from '@src/app/base';
import { ENUM_COLUMN_TYPES, ENUM_TABLE_NAMES } from '@src/shared';
import { Column, Entity } from 'typeorm';

@Entity(ENUM_TABLE_NAMES.REVIEWS, { orderBy: { createdAt: 'DESC' } })
export class Review extends BaseEntity {
  public static readonly SEARCH_TERMS: string[] = [];
  @Column({ type: ENUM_COLUMN_TYPES.TEXT, nullable: true })
  name?: string;

  @Column({ type: ENUM_COLUMN_TYPES.TEXT, nullable: true })
  statement?: string;

  @Column({ type: ENUM_COLUMN_TYPES.TEXT, nullable: false, default: 'Product' })
  segment?: string;

  @Column({ type: ENUM_COLUMN_TYPES.FLOAT, nullable: false, default: 1 })
  rating?: number;

  @Column({ type: ENUM_COLUMN_TYPES.JSONB, nullable: true, default: [] })
  attachments?: any;

  @Column({ type: ENUM_COLUMN_TYPES.INT, nullable: true, default: 0 })
  position?: number;
}
