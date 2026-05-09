import { BaseEntity } from '@src/app/base';
import { ENUM_TABLE_NAMES } from '@src/shared';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { Product } from './product.entity';
import { Category } from './category.entity';

@Entity(ENUM_TABLE_NAMES.PRODUCT_CATEGORIES, { orderBy: { createdAt: 'DESC' } })
export class ProductCategory extends BaseEntity {
  public static readonly SEARCH_TERMS: string[] = [];
  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  product?: Product;

  @RelationId((e: ProductCategory) => e.product)
  @Column({ nullable: false })
  productId?: string;

  @ManyToOne(() => Category, { onDelete: 'CASCADE' })
  category?: Category;

  @RelationId((e: ProductCategory) => e.category)
  @Column({ nullable: false })
  categoryId?: string;
}
