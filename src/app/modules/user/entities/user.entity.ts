import { BaseEntity } from '@src/app/base';
import { ENUM_AUTH_PROVIDERS, ENUM_COLUMN_TYPES, ENUM_TABLE_NAMES } from '@src/shared';
import { Type } from 'class-transformer';
import { Column, Entity, OneToMany } from 'typeorm';
import { UserRole } from './userRole.entity';

@Entity(ENUM_TABLE_NAMES.USERS, { orderBy: { createdAt: 'DESC' } })
export class User extends BaseEntity {
  public static readonly SEARCH_TERMS: string[] = ['fullName', 'username', 'email', 'phoneNumber'];

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 225, nullable: true })
  fullName?: string;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 225, nullable: true })
  gender?: string;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 100, nullable: true, unique: true })
  username?: string;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 150, nullable: true, unique: true })
  email?: string;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 20, nullable: true, unique: true })
  phoneNumber?: string;

  @Column({ type: ENUM_COLUMN_TYPES.TEXT, nullable: true })
  avatar?: string;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 50, default: ENUM_AUTH_PROVIDERS.SYSTEM })
  authProvider?: string;

  @Column({ type: ENUM_COLUMN_TYPES.JSONB, default: {}, select: false })
  authProviderMetaInfo?: any;

  @Column({ type: ENUM_COLUMN_TYPES.TEXT, nullable: false, select: false })
  password?: string;

  @Column({ type: ENUM_COLUMN_TYPES.BOOLEAN, nullable: true, default: false })
  isVerified?: boolean;

  @OneToMany(() => UserRole, (e) => e.user)
  @Type(() => UserRole)
  userRoles?: UserRole[];
}
