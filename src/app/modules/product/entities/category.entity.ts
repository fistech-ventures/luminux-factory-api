import { BaseEntity } from '@src/app/base';
import { ENUM_COLUMN_TYPES, ENUM_TABLE_NAMES } from '@src/shared';
import { Column, Entity, Index, ManyToOne, OneToMany, RelationId } from 'typeorm';
import { Product } from './product.entity';

@Entity(ENUM_TABLE_NAMES.CATEGORIES)
export class Category extends BaseEntity {
  public static readonly SEARCH_TERMS: string[] = ['title'];
  @Index()
  @Column({ length: 256, type: ENUM_COLUMN_TYPES.VARCHAR, nullable: false, unique: true })
  title?: string;

  @Column({ type: ENUM_COLUMN_TYPES.TEXT, nullable: true })
  icon?: string;

  @Column({ type: ENUM_COLUMN_TYPES.TEXT, nullable: true })
  banner?: string;

  @Column({ type: ENUM_COLUMN_TYPES.INT, default: 0, nullable: false })
  position?: number;

  @ManyToOne(() => Category, { onDelete: 'SET NULL', nullable: true })
  parent?: Category;

  @Index()
  @RelationId((e: Category) => e.parent)
  @Column({ nullable: true })
  parentId?: string;

  @OneToMany(() => Category, (category) => category.parent)
  children?: Category[];

  @OneToMany(() => Product, (product) => product.category)
  products?: Product[];
}