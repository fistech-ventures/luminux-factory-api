import { BaseEntity } from '@src/app/base';
import { ENUM_COLUMN_TYPES, ENUM_TABLE_NAMES } from '@src/shared';
import { Column, Entity, Index, JoinColumn, OneToOne, RelationId } from 'typeorm';
import { ENUM_USER_MEMBERSHIP_STATUS } from '../const';
import { User } from './user.entity';

@Entity(ENUM_TABLE_NAMES.USER_MEMBERSHIPS, { orderBy: { createdAt: 'DESC' } })
export class UserMembership extends BaseEntity {
  public static readonly SEARCH_TERMS: string[] = ['name', 'email', 'phoneNumber', 'code', 'bloodGroup'];

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 250, nullable: false })
  name?: string;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 250, nullable: false })
  email?: string;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 250, nullable: false })
  phoneNumber?: string;

  @Column({ type: ENUM_COLUMN_TYPES.BOOLEAN, nullable: true, default: false })
  isThisWhatsAppNumber?: boolean;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 250, nullable: false, unique: true })
  code?: string;

  @Column({ type: ENUM_COLUMN_TYPES.TEXT, nullable: true })
  image?: string;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 10, nullable: true })
  dateOfBirth?: string;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 35, nullable: false, unique: false })
  gender?: string;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 15, nullable: true })
  bloodGroup?: string;

  @Column({ type: ENUM_COLUMN_TYPES.BOOLEAN, default: false })
  highlightOnBirthday?: boolean;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 250, nullable: false, default: ENUM_USER_MEMBERSHIP_STATUS.PENDING })
  status?: string;

  @OneToOne(() => User, (user) => user.membership, {
    nullable: true,
    onDelete: 'NO ACTION',
  })
  @JoinColumn()
  user?: User;

  @Index()
  @RelationId((author: UserMembership) => author.user)
  @Column({ nullable: false })
  userId?: string;
}
