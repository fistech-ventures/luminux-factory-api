import { BaseEntity } from '@src/app/base';
import { ENUM_COLUMN_TYPES, ENUM_TABLE_NAMES } from '@src/shared';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { Offer } from './offer.entity';
import { Category } from '../../product/entities/category.entity';
import { Product } from '../../product/entities/product.entity';
import { ProductVariantOption } from '../../product/entities/productVariantOption.entity';

@Entity(ENUM_TABLE_NAMES.OFFER_SCOPES, { orderBy: { createdAt: 'DESC' } })
export class OfferScope extends BaseEntity {
  public static readonly SEARCH_TERMS: string[] = [];

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, nullable: false })
  scopeType?: string;

  @ManyToOne(() => Offer, { onDelete: 'CASCADE' })
  offer?: Offer;

  @RelationId((scope: OfferScope) => scope.offer)
  @Column({ nullable: false })
  offerId?: string;

  @ManyToOne(() => Category, { nullable: true, onDelete: 'SET NULL' })
  category?: Category;

  @RelationId((scope: OfferScope) => scope.category)
  @Column({ nullable: true })
  categoryId?: string;

  @ManyToOne(() => Product, { nullable: true, onDelete: 'SET NULL' })
  product?: Product;

  @RelationId((scope: OfferScope) => scope.product)
  @Column({ nullable: true })
  productId?: string;

  @ManyToOne(() => ProductVariantOption, { nullable: true, onDelete: 'SET NULL' })
  productVariant?: ProductVariantOption;

  @RelationId((scope: OfferScope) => scope.productVariant)
  @Column({ nullable: true })
  productVariantId?: string;
}
