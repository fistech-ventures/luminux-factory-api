import { BaseEntity } from '@src/app/base';
import { ENUM_COLUMN_TYPES, ENUM_TABLE_NAMES } from '@src/shared';
import { Type } from 'class-transformer';
import { Column, Entity, Index, ManyToOne, RelationId } from 'typeorm';
import { Area } from '../../common/entities/area.entity';
import { User } from './user.entity';

@Entity(ENUM_TABLE_NAMES.USER_ADDRESSES, { orderBy: { createdAt: 'DESC' } })
export class UserAddress extends BaseEntity {
  public static readonly SEARCH_TERMS: string[] = [
    'addressLine1',
    'addressLine1',
    'fullName',
    'phoneNumber',
    'email',
    'area.title',
    'area.titleBn',
  ];

  @Column({ type: ENUM_COLUMN_TYPES.BOOLEAN, nullable: true, default: false })
  isDefault?: boolean;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 255, nullable: false })
  label?: string;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 255, nullable: false })
  fullName?: string;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 255, nullable: false })
  phoneNumber?: string;

  @Column({ type: ENUM_COLUMN_TYPES.BOOLEAN, nullable: true, default: false })
  isThisWhatsAppNumber?: boolean;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 255, nullable: true })
  email?: string;

  @Column({ type: ENUM_COLUMN_TYPES.TEXT, nullable: true })
  addressLine1?: string;

  @Column({ type: ENUM_COLUMN_TYPES.TEXT, nullable: true })
  addressLine2?: string;

  @ManyToOne(() => Area, { onDelete: 'NO ACTION' })
  @Type(() => Area)
  area?: Area;

  @Index()
  @RelationId((e: UserAddress) => e.area)
  @Column({ nullable: false })
  areaId?: string;

  @ManyToOne(() => User, { onDelete: 'NO ACTION' })
  @Type(() => User)
  user?: User;

  @Index()
  @RelationId((e: UserAddress) => e.user)
  @Column({ nullable: false })
  userId?: string;
}
