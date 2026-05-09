import { BaseEntity } from '@src/app/base';
import { ENUM_COLUMN_TYPES, ENUM_TABLE_NAMES } from '@src/shared';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { Order } from '../../order/entities/order.entity';
import { ServiceProvider } from './serviceProvider.entity';

@Entity(ENUM_TABLE_NAMES.PROVIDER_SERVICE_REQUESTS, { orderBy: { createdAt: 'DESC' } })
export class ProviderServiceRequest extends BaseEntity {
  public static readonly SEARCH_TERMS: string[] = ['providerTrackingCode', 'orderCode'];
  @Column({ length: 256, type: ENUM_COLUMN_TYPES.VARCHAR, nullable: false })
  status?: string; // Ready To Ship | Picked from Store | Booked | Out For Delivery | Rescheduled | Delivered | Returned to Hub

  @Column({ length: 256, type: ENUM_COLUMN_TYPES.VARCHAR, nullable: true })
  providerTrackingCode?: string;

  @Column({ length: 256, type: ENUM_COLUMN_TYPES.VARCHAR, nullable: false })
  orderCode?: string;

  @Column({ length: 256, type: ENUM_COLUMN_TYPES.VARCHAR, nullable: false })
  serviceType?: string;

  @ManyToOne(() => Order, { onDelete: 'CASCADE' })
  order?: Order;

  @RelationId((e: ProviderServiceRequest) => e.order)
  @Column({ nullable: false })
  orderId?: string;

  @ManyToOne(() => ServiceProvider, { onDelete: 'CASCADE' })
  serviceProvider?: ServiceProvider;

  @RelationId((e: ProviderServiceRequest) => e.serviceProvider)
  @Column({ nullable: false })
  serviceProviderId?: string;

  @Column({
    type: ENUM_COLUMN_TYPES.JSONB,
    default: [],
    nullable: false,
  })
  changeTrack?: any;
}
