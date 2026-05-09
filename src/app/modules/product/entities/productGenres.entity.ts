import { BaseEntity } from '@src/app/base';
import { ENUM_TABLE_NAMES } from '@src/shared';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { Genre } from './genre.entity';
import { Product } from './product.entity';

@Entity(ENUM_TABLE_NAMES.PRODUCT_GENRES, { orderBy: { createdAt: 'DESC' } })
export class ProductGenre extends BaseEntity {
  public static readonly SEARCH_TERMS: string[] = [];
  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  product?: Product;

  @RelationId((e: ProductGenre) => e.product)
  @Column({ nullable: false })
  productId?: string;

  @ManyToOne(() => Genre, { onDelete: 'CASCADE' })
  genre?: Genre;

  @RelationId((e: ProductGenre) => e.genre)
  @Column({ nullable: false })
  genreId?: string;
}
