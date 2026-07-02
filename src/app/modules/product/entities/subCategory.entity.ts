import { BaseEntity } from '@src/app/base';
import { ENUM_COLUMN_TYPES, ENUM_TABLE_NAMES } from '@src/shared';
import { Column, Entity, Index, ManyToOne, RelationId } from 'typeorm';
import { Category } from './category.entity';

@Entity(ENUM_TABLE_NAMES.SUB_CATEGORIES)
export class SubCategory extends BaseEntity {
  public static readonly SEARCH_TERMS: string[] = ['title'];

  @Index()
  @Column({ length: 256, type: ENUM_COLUMN_TYPES.VARCHAR, nullable: false })
  title?: string;

  @Column({ type: ENUM_COLUMN_TYPES.TEXT, nullable: true })
  icon?: string;

  @Column({ type: ENUM_COLUMN_TYPES.TEXT, nullable: true })
  banner?: string;

  @Column({ type: ENUM_COLUMN_TYPES.INT, default: 0, nullable: false })
  position?: number;

  @ManyToOne(() => Category, { onDelete: 'SET NULL', nullable: true })
  category?: Category;

  @Index()
  @RelationId((e: SubCategory) => e.category)
  @Column({ nullable: true })
  categoryId?: string;
}
