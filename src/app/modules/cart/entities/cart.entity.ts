import { BaseEntity } from '@src/app/base';
import { ENUM_COLUMN_TYPES, ENUM_TABLE_NAMES } from '@src/shared';
import { Column, Entity, ManyToOne, OneToMany, RelationId } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { CartItem } from './cartItem.entity';

@Entity(ENUM_TABLE_NAMES.CARTS, { orderBy: { createdAt: 'DESC' } })
export class Cart extends BaseEntity {
  public static readonly SEARCH_TERMS: string[] = [];

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 250, nullable: false, default: 'active' })
  status?: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user?: User;

  @RelationId((cart: Cart) => cart.user)
  @Column({ nullable: false })
  userId?: string;

  @OneToMany(() => CartItem, (e) => e.cart)
  items?: CartItem[];
}
