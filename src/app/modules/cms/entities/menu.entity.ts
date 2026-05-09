import { BaseEntity } from '@src/app/base';
import { ENUM_COLUMN_TYPES, ENUM_TABLE_NAMES } from '@src/shared';
import { Type } from 'class-transformer';
import { Column, Entity, ManyToOne, OneToMany, RelationId } from 'typeorm';
import { Page } from './page.entity';

@Entity(ENUM_TABLE_NAMES.MENUS, { orderBy: { position: 'ASC' } })
export class Menu extends BaseEntity {
  public static readonly SEARCH_TERMS: string[] = ['title'];

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 250, nullable: false })
  title?: string;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, nullable: false })
  slug?: string;

  @Column({ type: ENUM_COLUMN_TYPES.TEXT, nullable: true })
  icon?: string;

  @Column({ type: ENUM_COLUMN_TYPES.TEXT, nullable: true })
  externalUrl?: string;

  @Column({ type: ENUM_COLUMN_TYPES.INT, nullable: false, default: 0 })
  position?: number;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, nullable: false, default: 'header' })
  type?: string;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, nullable: true, default: null })
  handles?: string;

  @Column({ type: ENUM_COLUMN_TYPES.JSONB, nullable: true })
  config?: any;

  @ManyToOne(() => Page, { nullable: true, onDelete: 'CASCADE' })
  @Type(() => Page)
  page?: Page;

  @RelationId((menu: Menu) => menu.page)
  @Column({ nullable: true })
  pageId?: string;

  @ManyToOne(() => Menu, (menu) => menu.childrens, { nullable: true, onDelete: 'CASCADE' })
  @Type(() => Menu)
  parent?: Menu;

  @RelationId((menu: Menu) => menu.parent)
  @Column({ nullable: true })
  parentId?: string;

  @OneToMany(() => Menu, (menu) => menu.parent)
  @Type(() => Menu)
  childrens?: Menu[];
}
