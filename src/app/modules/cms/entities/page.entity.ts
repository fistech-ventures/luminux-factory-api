import { BaseEntity } from '@src/app/base';
import { ENUM_COLUMN_TYPES, ENUM_TABLE_NAMES } from '@src/shared';
import { Type } from 'class-transformer';
import { Column, Entity, OneToMany } from 'typeorm';
import { PageSection } from './pageSection.entity';

@Entity(ENUM_TABLE_NAMES.PAGES, { orderBy: { createdAt: 'DESC' } })
export class Page extends BaseEntity {
  public static readonly SEARCH_TERMS: string[] = ['title'];

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 250, nullable: false, unique: true })
  title?: string;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, nullable: false, unique: true })
  slug?: string;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, nullable: false })
  contentType?: string;

  @Column({ type: ENUM_COLUMN_TYPES.TEXT, nullable: true })
  content?: string;

  @OneToMany(() => PageSection, (section) => section.page)
  @Type(() => PageSection)
  sections?: PageSection[];
}
