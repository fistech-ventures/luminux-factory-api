import { BaseEntity } from '@src/app/base';
import { ENUM_COLUMN_TYPES, ENUM_TABLE_NAMES } from '@src/shared';
import { Type } from 'class-transformer';
import { Column, Entity, Index, ManyToOne, OneToMany, RelationId } from 'typeorm';
import { ServiceProvider } from '../../logistic/entities/serviceProvider.entity';
import { Note } from '../../note/entities/note.entity';
import { ENUM_PAYMENT_GATEWAY_TYPE } from '../../payment-gateway/enums';
import { UserInvoice } from '../../transaction/entities/userInvoice.entity';
import { User } from '../../user/entities/user.entity';
import { UserMembership } from '../../user/entities/userMembership.entity';
import { ENUM_DELIVERY_URGENCY, ENUM_DELIVERY_ZONE, ENUM_INTERNAL_ORDER_STATUS, ENUM_ORDER_PAYMENT_STATUS, ENUM_PANEL, ENUM_PRIORITY, IOrderAddress } from '../const';
import { OrderItem } from './orderItem.entity';
import { OrderStatus } from './orderStatus.entity';
import { IAuthUser } from '@src/app/interfaces';

@Entity(ENUM_TABLE_NAMES.ORDERS)
export class Order extends BaseEntity {
  public static readonly SEARCH_TERMS: string[] = ['code', 'user.phoneNumber'];

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 250, nullable: false, unique: true })
  code?: string;

  @Column({ type: ENUM_COLUMN_TYPES.INT, nullable: false, default: 1 })
  totalProduct?: number;

  @Column({ type: ENUM_COLUMN_TYPES.INT, nullable: false, default: 1 })
  totalItem?: number;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, nullable: true })
  discountType?: string;

  @Column({ type: ENUM_COLUMN_TYPES.INT, nullable: false, default: 0 })
  discountAmount?: number;

  @Column({ type: ENUM_COLUMN_TYPES.INT, nullable: false, default: 0 })
  deliveryCharge?: number;

  @Column({ type: ENUM_COLUMN_TYPES.INT, nullable: false, default: 0 })
  subTotal?: number;

  @Column({ type: ENUM_COLUMN_TYPES.INT, nullable: false, default: 0 })
  total?: number;

  @Column({ type: ENUM_COLUMN_TYPES.INT, nullable: false, default: 0 })
  grandTotal?: number;

  @Column({ type: ENUM_COLUMN_TYPES.INT, nullable: false, default: 0 })
  paidAmount?: number;

  @Column({ type: ENUM_COLUMN_TYPES.INT, nullable: false, default: 0 })
  dueAmount?: number;

  @Column({ type: ENUM_COLUMN_TYPES.BOOLEAN, default: false })
  sendAsGift?: boolean;

  @Column({ type: ENUM_COLUMN_TYPES.TEXT, nullable: true })
  pasteBoard?: string;

  @Column({ type: ENUM_COLUMN_TYPES.TEXT, nullable: true, default: 'Handle with care. Please call in 10 min if not answered first time.' })
  customerInstruction?: string;

  @Index()
  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 250, nullable: false, default: ENUM_INTERNAL_ORDER_STATUS.PENDING })
  status?: string;

  @Index()
  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 250, nullable: false, default: ENUM_DELIVERY_ZONE.INSIDE_DHAKA })
  deliveryZone?: string;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 250, nullable: false, default: ENUM_DELIVERY_URGENCY.REGULAR })
  deliveryUrgency?: string;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 250, nullable: false, default: ENUM_PRIORITY.REGULAR })
  priority?: string;

  @Index()
  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 250, nullable: false, default: ENUM_ORDER_PAYMENT_STATUS.UNPAID })
  paymentStatus?: string;

  @Index()
  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 250, nullable: false, default: ENUM_PAYMENT_GATEWAY_TYPE.COD })
  paymentMethod?: string;

  @Index()
  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 250, })
  source?: string;

  @Index()
  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 250, default: ENUM_PANEL.PANEL, nullable: false })
  panel?: string;

  @Column({ type: ENUM_COLUMN_TYPES.JSONB, nullable: true })
  address?: IOrderAddress;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  user?: User;

  @Index()
  @RelationId((order: Order) => order.user)
  @Column({ nullable: false })
  userId?: string;

  @ManyToOne(() => UserMembership, { onDelete: 'RESTRICT' })
  userMembership?: UserMembership;

  @Index()
  @RelationId((order: Order) => order.userMembership)
  @Column({ nullable: true })
  userMembershipId?: string;

  @OneToMany(() => OrderItem, (e) => e.order)
  items?: OrderItem[];

  @OneToMany(() => OrderStatus, (e) => e.order)
  statuses?: OrderStatus[];

  @ManyToOne(() => UserInvoice, { onDelete: 'NO ACTION' })
  @Type(() => UserInvoice)
  userInvoice?: UserInvoice;

  @Index()
  @RelationId((e: Order) => e.userInvoice)
  @Column({ nullable: true })
  userInvoiceId?: string;

  @ManyToOne(() => ServiceProvider, { onDelete: 'RESTRICT' })
  deliveryPartner?: ServiceProvider;

  @RelationId((order: Order) => order.deliveryPartner)
  @Column({ nullable: true })
  deliveryPartnerId?: string;

  @Column({ type: ENUM_COLUMN_TYPES.JSONB, nullable: true, default: null })
  salesPerson?: IAuthUser;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 250, nullable: true, default: null })
  salesPersonId?: string;

  @OneToMany(() => Note, (e) => e.order)
  notes?: Note[];
}
