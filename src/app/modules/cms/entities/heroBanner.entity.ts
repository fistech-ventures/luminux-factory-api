import { BaseEntity } from '@src/app/base';
import { ENUM_COLUMN_TYPES, ENUM_TABLE_NAMES } from '@src/shared';
import { Column, Entity } from 'typeorm';

@Entity(ENUM_TABLE_NAMES.HERO_BANNERS, { orderBy: { createdAt: 'DESC' } })
export class HeroBanner extends BaseEntity {
  public static readonly SEARCH_TERMS: string[] = ['title'];

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 250, nullable: false, unique: true })
  title?: string;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 500, nullable: true })
  description?: string;

  @Column({ type: ENUM_COLUMN_TYPES.TEXT, nullable: false })
  url?: string;

  @Column({ type: ENUM_COLUMN_TYPES.TEXT, default: '#', nullable: false })
  redirectUrl?: string;

  @Column({ type: ENUM_COLUMN_TYPES.INT, nullable: false })
  position?: number;
}
