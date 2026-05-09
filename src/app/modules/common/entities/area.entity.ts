import { BaseEntity } from '@src/app/base';
import { ENUM_COLUMN_TYPES, ENUM_TABLE_NAMES } from '@src/shared';
import { Column, Entity, Index, ManyToOne, RelationId } from 'typeorm';
import { DeliveryCharge } from './deliveryCharge.entity';

@Entity(ENUM_TABLE_NAMES.AREAS, { orderBy: { createdAt: 'DESC' } })
export class Area extends BaseEntity {
  public static readonly SEARCH_TERMS: string[] = ['title', 'titleBn'];

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 250, nullable: false, unique: true })
  title?: string;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 250, nullable: true, unique: true })
  titleBn?: string;

  @ManyToOne(() => DeliveryCharge, { onDelete: 'CASCADE' })
  deliveryCharge?: DeliveryCharge;

  @Index()
  @RelationId((e: Area) => e.deliveryCharge)
  @Column({ nullable: false })
  deliveryChargeId?: string;
}
