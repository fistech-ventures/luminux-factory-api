import { BaseEntity } from '@src/app/base';
import { ENUM_COLUMN_TYPES, ENUM_TABLE_NAMES } from '@src/shared';
import { Column, Entity } from 'typeorm';

@Entity(ENUM_TABLE_NAMES.PANEL_TRAININGS, { orderBy: { priority: 'ASC' } })
export class PanelTraining extends BaseEntity {
  public static readonly SEARCH_TERMS: string[] = ['title'];

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, nullable: true })
  title?: string;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, nullable: true })
  panel?: string;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, nullable: true })
  module?: string;

  @Column({ type: ENUM_COLUMN_TYPES.TEXT, nullable: true })
  description?: string;

  @Column({ type: ENUM_COLUMN_TYPES.TEXT, nullable: true })
  video?: string;

  @Column({ type: ENUM_COLUMN_TYPES.INT, nullable: true, default: 0 })
  priority?: number;
}
