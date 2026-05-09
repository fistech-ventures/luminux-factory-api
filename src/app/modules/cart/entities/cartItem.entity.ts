import { BaseEntity } from '@src/app/base';
import { ENUM_COLUMN_TYPES, ENUM_TABLE_NAMES } from '@src/shared';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { Cart } from './cart.entity';

@Entity(ENUM_TABLE_NAMES.CART_ITEMS, { orderBy: { createdAt: 'DESC' } })
export class CartItem extends BaseEntity {
  public static readonly SEARCH_TERMS: string[] = [];

  @Column({ type: ENUM_COLUMN_TYPES.INT, nullable: false, default: 1 })
  quantity?: number;

  @Column({ type: ENUM_COLUMN_TYPES.JSONB, nullable: true })
  product?: any;

  @Column({ nullable: true })
  productId?: string;

  @Column({ type: ENUM_COLUMN_TYPES.JSONB, nullable: true })
  productVariantOption?: any;

  @Column({ nullable: true })
  productVariantOptionId?: string;

  @ManyToOne(() => Cart, { onDelete: 'CASCADE' })
  cart?: Cart;

  @RelationId((e: CartItem) => e.cart)
  @Column({ nullable: false })
  cartId?: string;
}
