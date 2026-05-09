import { BaseEntity } from '@src/app/base';
import { ENUM_COLUMN_TYPES, ENUM_TABLE_NAMES } from '@src/shared';
import { Column, Entity, Index, ManyToOne, RelationId } from 'typeorm';
import { Order } from '../../order/entities/order.entity';
import { User } from '../../user/entities/user.entity';
import { ENUM_PRODUCT_REVIEW_STATUS } from '../const';
import { Product } from './product.entity';

@Entity(ENUM_TABLE_NAMES.PRODUCT_REVIEWS, { orderBy: { createdAt: 'DESC' } })
export class ProductReview extends BaseEntity {
  public static readonly SEARCH_TERMS: string[] = ['statement'];
  @Column({ type: ENUM_COLUMN_TYPES.TEXT, nullable: false })
  statement?: string;

  @Column({ type: ENUM_COLUMN_TYPES.FLOAT, nullable: false, default: 1 })
  rating?: number;

  @Column({ type: ENUM_COLUMN_TYPES.JSONB, nullable: true, default: [] })
  attachments?: any;

  @Column({ length: 25, type: ENUM_COLUMN_TYPES.VARCHAR, nullable: false, default: ENUM_PRODUCT_REVIEW_STATUS.PENDING })
  status?: string;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  product?: Product;

  @Index()
  @RelationId((e: ProductReview) => e.product)
  @Column({ nullable: false })
  productId?: string;

  @ManyToOne(() => Order, { onDelete: 'CASCADE' })
  order?: Order;

  @RelationId((e: ProductReview) => e.order)
  @Column({ nullable: true })
  orderId?: string;

  @Column({ type: ENUM_COLUMN_TYPES.BOOLEAN, default: false })
  isOrderVerified?: boolean;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user?: User;

  @RelationId((e: ProductReview) => e.user)
  @Column({ nullable: false })
  userId?: string;

  @Index()
  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 250, nullable: true })
  source?: string;
}
