import { BaseEntity } from '@src/app/base';
import { ENUM_COLUMN_TYPES, ENUM_TABLE_NAMES } from '@src/shared';
import { Column, Entity } from 'typeorm';

@Entity(ENUM_TABLE_NAMES.ANALYTICS_CONFIGS, { orderBy: { createdAt: 'DESC' } })
export class AnalyticsConfig extends BaseEntity {
  public static readonly SEARCH_TERMS: string[] = [];

  @Column({ type: ENUM_COLUMN_TYPES.TEXT, nullable: true })
  googleSiteVerification?: string;

  @Column({ type: ENUM_COLUMN_TYPES.TEXT, nullable: true })
  bingSiteVerification?: string;

  @Column({ type: ENUM_COLUMN_TYPES.TEXT, nullable: true })
  googleTagManagerCode?: string;

  @Column({ type: ENUM_COLUMN_TYPES.TEXT, nullable: true })
  googleAnalyticsId?: string;

  @Column({ type: ENUM_COLUMN_TYPES.TEXT, nullable: true })
  metaPixelId?: string;

  @Column({ type: ENUM_COLUMN_TYPES.TEXT, nullable: true })
  metaAppId?: string;

  @Column({ type: ENUM_COLUMN_TYPES.TEXT, nullable: true })
  metaMessengerId?: string;

  @Column({ type: ENUM_COLUMN_TYPES.TEXT, nullable: true })
  umamiId?: string;
}
