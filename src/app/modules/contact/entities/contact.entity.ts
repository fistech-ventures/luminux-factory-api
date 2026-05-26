import { BaseEntity } from '@src/app/base';
import { ENUM_COLUMN_TYPES, ENUM_TABLE_NAMES } from '@src/shared';
import { Column, Entity, Index } from 'typeorm';
import { ENUM_CONTACT_STATUS, ENUM_CONTACT_TYPE } from '../enums';

@Entity(ENUM_TABLE_NAMES.CONTACTS, { orderBy: { createdAt: 'DESC' } })
export class Contact extends BaseEntity {
  public static readonly SEARCH_TERMS: string[] = [
    'fullName',
    'email',
    'subject',
    'message',
  ];

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 255, nullable: false })
  fullName?: string;

  @Index()
  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 125, nullable: false })
  email?: string;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 255, nullable: false })
  subject?: string;

  @Column({ type: ENUM_COLUMN_TYPES.TEXT, nullable: false })
  message?: string;

  @Index()
  @Column({
    type: ENUM_COLUMN_TYPES.ENUM,
    enumName: 'enum_contact_status',
    enum: Object.values(ENUM_CONTACT_STATUS),
    nullable: false,
    default: ENUM_CONTACT_STATUS.PENDING,
  })
  status?: string;

  @Index()
  @Column({
    type: ENUM_COLUMN_TYPES.ENUM,
    enumName: 'enum_contact_type',
    enum: Object.values(ENUM_CONTACT_TYPE),
    nullable: false,
  })
  type?: string;
}
