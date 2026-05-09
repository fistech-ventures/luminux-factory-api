import { BaseEntity } from '@src/app/base';
import { ENUM_TABLE_NAMES } from '@src/shared';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { Gallery } from '../../gallery/entities/gallery.entity';
import { Product } from './product.entity';

@Entity(ENUM_TABLE_NAMES.PRODUCT_MEDIAS, { orderBy: { createdAt: 'DESC' } })
export class ProductMedia extends BaseEntity {
  public static readonly SEARCH_TERMS: string[] = [];
  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  product?: Product;

  @RelationId((e: ProductMedia) => e.product)
  @Column({ nullable: false })
  productId?: string;

  @ManyToOne(() => Gallery, { onDelete: 'CASCADE' })
  gallery?: Gallery;

  @RelationId((e: ProductMedia) => e.gallery)
  @Column({ nullable: false })
  galleryId?: string;
}
