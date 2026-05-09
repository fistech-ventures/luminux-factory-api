import { BaseEntity } from '@src/app/base';
import { ENUM_TABLE_NAMES } from '@src/shared';
import { Type } from 'class-transformer';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { Product } from '../../product/entities/product.entity';
import { User } from './user.entity';

@Entity(ENUM_TABLE_NAMES.USER_WISHLISTS, { orderBy: { createdAt: 'DESC' } })
export class UserWishlist extends BaseEntity {
  public static readonly SEARCH_TERMS: string[] = [];
  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @Type(() => Product)
  product?: Product;

  @RelationId((e: UserWishlist) => e.product)
  @Column({ nullable: false })
  productId?: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @Type(() => User)
  user?: User;

  @RelationId((e: UserWishlist) => e.user)
  @Column({ nullable: false })
  userId?: string;
}
