import { BaseEntity } from '@src/app/base';
import { ENUM_COLUMN_TYPES, ENUM_TABLE_NAMES } from '@src/shared';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { ENUM_PRODUCT_REQUEST_STATUS } from '../const';
import { Product } from './product.entity';

@Entity(ENUM_TABLE_NAMES.PRODUCT_REQUESTS, { orderBy: { createdAt: 'DESC' } })
export class ProductRequest extends BaseEntity {
  public static readonly SEARCH_TERMS: string[] = ['name', 'phoneNumber'];
  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 100, nullable: false })
  name?: string;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 20, nullable: false })
  phoneNumber?: string;

  @Column({ type: ENUM_COLUMN_TYPES.BOOLEAN, default: false })
  isThisWhatsAppNumber?: boolean;

  @Column({ type: ENUM_COLUMN_TYPES.TEXT, nullable: false })
  note?: string;

  @Column({ type: ENUM_COLUMN_TYPES.JSONB, nullable: true, default: [] })
  attachments?: any;

  @Column({ type: ENUM_COLUMN_TYPES.TEXT, nullable: true })
  reference?: string;

  @Column({ type: ENUM_COLUMN_TYPES.TEXT, nullable: true })
  addressDetails?: string;

  @Column({ length: 25, type: ENUM_COLUMN_TYPES.VARCHAR, nullable: false, default: ENUM_PRODUCT_REQUEST_STATUS.PENDING })
  status?: string;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  product?: Product;

  @RelationId((e: ProductRequest) => e.product)
  @Column({ nullable: true })
  productId?: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user?: User;

  @RelationId((e: ProductRequest) => e.user)
  @Column({ nullable: true })
  userId?: string;
}
