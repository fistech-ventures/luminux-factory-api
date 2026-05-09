import { BaseEntity } from '@src/app/base';
import { ENUM_COLUMN_TYPES, ENUM_TABLE_NAMES } from '@src/shared';
import { Type } from 'class-transformer';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { Author } from '../../author/entities/author.entity';
import { Gallery } from '../../gallery/entities/gallery.entity';
import { Category } from '../../product/entities/category.entity';
import { Genre } from '../../product/entities/genre.entity';
import { Product } from '../../product/entities/product.entity';
import { Section } from './section.entity';

@Entity(ENUM_TABLE_NAMES.SECTION_ITEMS, { orderBy: { position: 'ASC' } })
export class SectionItem extends BaseEntity {
  public static readonly SEARCH_TERMS: string[] = [];

  @ManyToOne(() => Section, { onDelete: 'CASCADE' })
  @Type(() => Section)
  section?: Section;

  @RelationId((e: SectionItem) => e.section)
  @Column({ nullable: false })
  sectionId?: string;

  @Column({ type: ENUM_COLUMN_TYPES.INT, nullable: false, default: 0 })
  position?: number;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @Type(() => Product)
  product?: Product;

  @RelationId((e: SectionItem) => e.product)
  @Column({ nullable: true })
  productId?: string;

  @ManyToOne(() => Genre, { onDelete: 'CASCADE' })
  @Type(() => Genre)
  genre?: Genre;

  @RelationId((e: SectionItem) => e.genre)
  @Column({ nullable: true })
  genreId?: string;

  @ManyToOne(() => Author, { onDelete: 'CASCADE' })
  @Type(() => Author)
  author?: Author;

  @RelationId((e: SectionItem) => e.author)
  @Column({ nullable: true })
  authorId?: string;

  @ManyToOne(() => Category, { onDelete: 'CASCADE' })
  @Type(() => Category)
  category?: Category;

  @RelationId((e: SectionItem) => e.category)
  @Column({ nullable: true })
  categoryId?: string;

  @ManyToOne(() => Gallery, { onDelete: 'CASCADE' })
  @Type(() => Gallery)
  media?: Gallery;

  @RelationId((e: SectionItem) => e.media)
  @Column({ nullable: true })
  mediaId?: string;
}
