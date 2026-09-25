import { BaseEntity } from '@src/app/base';
import { ENUM_COLUMN_TYPES, ENUM_PAYMENT_METHODS, ENUM_TABLE_NAMES } from '@src/shared';
import { Column, Entity, Index, ManyToOne, OneToMany, RelationId } from 'typeorm';
import { Supplier } from '../../supplier/entities/supplier.entity';
import { User } from '../../user/entities/user.entity';
import { PurchaseItem } from './purchase-item.entity';

@Entity(ENUM_TABLE_NAMES.PURCHASES, { orderBy: { createdAt: 'DESC' } })
export class Purchase extends BaseEntity {
  public static readonly SEARCH_TERMS: string[] = ['purchaseType', 'supplier.companyName', 'supplier.contactNumber'];
  public static readonly DATE_FILTER_COLUMN: string = 'purchaseDate';

  @Column({ type: ENUM_COLUMN_TYPES.DATE, nullable: false })
  purchaseDate?: Date;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 100, nullable: false })
  purchaseType?: string;

  @ManyToOne(() => Supplier, { onDelete: 'RESTRICT' })
  supplier?: Supplier;

  @Index()
  @RelationId((purchase: Purchase) => purchase.supplier)
  @Column({ nullable: false })
  supplierId?: string;

  @OneToMany(() => PurchaseItem, (item) => item.purchase)
  items?: PurchaseItem[];

  @Column({ type: ENUM_COLUMN_TYPES.INT, nullable: false, default: 0 })
  totalQuantity?: number;

  @Column({ type: ENUM_COLUMN_TYPES.FLOAT, nullable: false, default: 0 })
  totalPurchaseAmount?: number;

  @Column({ type: ENUM_COLUMN_TYPES.FLOAT, nullable: false, default: 0 })
  paidAmount?: number;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 100, nullable: false })
  paymentMethod?: ENUM_PAYMENT_METHODS;

  @Column({ type: ENUM_COLUMN_TYPES.FLOAT, nullable: false, default: 0 })
  dueAmount?: number;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  purchasedBy?: User;

  @Index()
  @RelationId((purchase: Purchase) => purchase.purchasedBy)
  @Column({ nullable: false })
  purchasedById?: string;
}
