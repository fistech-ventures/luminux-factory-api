import { BaseEntity } from '@src/app/base';
import { ENUM_COLUMN_TYPES, ENUM_TABLE_NAMES } from '@src/shared';
import { Type } from 'class-transformer';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { Page } from './page.entity';
import { Section } from './section.entity';

@Entity(ENUM_TABLE_NAMES.PAGE_SECTIONS, { orderBy: { position: 'ASC' } })
export class PageSection extends BaseEntity {
  public static readonly SEARCH_TERMS: string[] = [];
  @ManyToOne(() => Section, { onDelete: 'CASCADE' })
  @Type(() => Section)
  section?: Section;

  @RelationId((e: PageSection) => e.section)
  @Column({ nullable: false })
  sectionId?: string;

  @ManyToOne(() => Page, { onDelete: 'CASCADE' })
  @Type(() => Page)
  page?: Page;

  @RelationId((e: PageSection) => e.page)
  @Column({ nullable: false })
  pageId?: string;

  @Column({ type: ENUM_COLUMN_TYPES.INT, nullable: false, default: 0 })
  position?: number;
}
