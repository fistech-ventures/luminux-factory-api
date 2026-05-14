import { BaseEntity } from '@src/app/base';
import { ENUM_COLUMN_TYPES, ENUM_TABLE_NAMES } from '@src/shared';
import { Column, Entity } from 'typeorm';

@Entity(ENUM_TABLE_NAMES.ANALYTICS_CONFIGS, { orderBy: { createdAt: 'DESC' } })
export class AnalyticsConfig extends BaseEntity {
  public static readonly SEARCH_TERMS: string[] = [];

  @Column({ type: ENUM_COLUMN_TYPES.JSONB, nullable: true, default: [] })
  trackingScripts?: string[];
}
