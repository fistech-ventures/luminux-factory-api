import { BaseEntity } from '@src/app/base';
import { ENUM_COLUMN_TYPES, ENUM_TABLE_NAMES } from '@src/shared';
import { ENUM_BLOOD_GROUP, ENUM_GENDER } from '@src/shared/enums/common.enums';
import { Type } from 'class-transformer';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { User } from './user.entity';

@Entity(ENUM_TABLE_NAMES.USER_PROFILES, { orderBy: { createdAt: 'DESC' } })
export class UserProfile extends BaseEntity {
  public static readonly SEARCH_TERMS: string[] = [
    'code',
    'fullName',
    'email',
    'phoneNumber',
  ];

  @Column({ type: ENUM_COLUMN_TYPES.BOOLEAN, nullable: true, default: false })
  isVerified?: boolean;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 20, nullable: false, unique: true })
  code?: string;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 255, nullable: false })
  fullName?: string;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 125, nullable: true })
  email?: string;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 20, nullable: true })
  phoneNumber?: string;

  @Column({ type: ENUM_COLUMN_TYPES.BOOLEAN, nullable: true, default: false })
  isThisWhatsAppNumber?: boolean;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 50, nullable: true })
  religion?: string;

  @Column({
    type: ENUM_COLUMN_TYPES.ENUM,
    enumName: 'enum_gender',
    enum: Object.values(ENUM_GENDER),
    nullable: true,
  })
  gender?: string;

  @Column({
    type: ENUM_COLUMN_TYPES.ENUM,
    enumName: 'enum_blood_group',
    enum: ENUM_BLOOD_GROUP,
    nullable: true,
  })
  bloodGroup?: string;

  @Column({ type: ENUM_COLUMN_TYPES.DATE, nullable: true })
  dateOfBirth?: Date;

  @Column({ type: ENUM_COLUMN_TYPES.TEXT, nullable: true })
  avatar?: string;

  @Column({ type: ENUM_COLUMN_TYPES.TEXT, nullable: true })
  introductionVideo?: string;

  @Column({ type: ENUM_COLUMN_TYPES.TEXT, nullable: true })
  address?: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @Type(() => User)
  user?: User;

  @RelationId((e: UserProfile) => e.user)
  @Column({ nullable: false })
  userId?: string;
}
