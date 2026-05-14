import { BaseEntity } from '@src/app/base';
import { ENUM_COLUMN_TYPES, ENUM_TABLE_NAMES } from '@src/shared';
import { Column, Entity } from 'typeorm';

@Entity(ENUM_TABLE_NAMES.GLOBAL_CONFIGS, { orderBy: { createdAt: 'DESC' } })
export class GlobalConfig extends BaseEntity {
  public static readonly SEARCH_TERMS: string[] = [];

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, nullable: true })
  name?: string;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, nullable: true })
  initialName?: string;

  @Column({ type: ENUM_COLUMN_TYPES.TEXT, nullable: true })
  icon?: string;

  @Column({ type: ENUM_COLUMN_TYPES.TEXT, nullable: true })
  logo?: string;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, nullable: true })
  themePrimaryColor?: string;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, nullable: true })
  themeSecondayColor?: string;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, nullable: true })
  phoneCode?: string;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, nullable: true })
  currency?: string;

  @Column({ type: ENUM_COLUMN_TYPES.TEXT, nullable: true })
  description?: string;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, nullable: true })
  phone?: string;

  @Column({ type: ENUM_COLUMN_TYPES.TEXT, nullable: true })
  address?: string;

  @Column({ type: ENUM_COLUMN_TYPES.JSONB, nullable: true })
  socialUrls?: Record<string, string>;

  @Column({ type: ENUM_COLUMN_TYPES.BOOLEAN, nullable: true, default: true })
  allowUserRegistration?: boolean;

  @Column({ type: ENUM_COLUMN_TYPES.BOOLEAN, nullable: true, default: false })
  userRegistrationVerificationRequired?: boolean;

  @Column({ type: ENUM_COLUMN_TYPES.BOOLEAN, nullable: true, default: true })
  needWebView?: boolean;

  @Column({ type: ENUM_COLUMN_TYPES.INT, nullable: true, default: 5 })
  otpExpiresInMin?: number;
}
