import { TableColumnOptions } from 'typeorm';

export enum ENUM_TABLE_NAMES {
  GALLERY = 'gallery',

  GLOBAL_CONFIGS = 'global_configs',
  ANALYTICS_CONFIGS = 'analytics_configs',
  PERMISSIONS = 'permissions',
  PERMISSION_TYPES = 'permission_types',
  ROLES = 'roles',
  USERS = 'users',
  USER_PROFILES = 'user_profiles',
  USER_ROLES = 'user_roles',
  ROLE_PERMISSIONS = 'role_permissions',

  // notification module tables
  SMS_GATEWAYS = 'sms_gateways',
  EMAIL_GATEWAYS = 'email_gateways',

  // Product module tables
  VARIANTS = 'variants',
  VARIANT_OPTIONS = 'variant_options',
  PRODUCTS = 'products',
  PRODUCT_VARIANT_OPTIONS = 'product_variant_options',

  // Sales module tables
  CUSTOMERS = 'customers',
  SUPPLIERS = 'suppliers',
  EMPLOYEES = 'employees',
  EXPENSES = 'expenses',
  PURCHASES = 'purchases',
  PURCHASE_ITEMS = 'purchase_items',
  SALES = 'sales',
  SALE_ITEMS = 'sale_items',
  LEDGERS = 'ledgers',
  PAYMENTS = 'payments',
}

export enum ENUM_COLUMN_TYPES {
  PRIMARY_KEY = 'uuid',
  INT = 'int',
  FLOAT = 'float',
  TEXT = 'text',
  VARCHAR = 'varchar',
  BOOLEAN = 'boolean',
  DATE = 'date',
  TIMESTAMP_UTC = 'timestamp without time zone',
  ENUM = 'enum',
  JSONB = 'jsonb',
}

export const defaultDateTimeColumns: TableColumnOptions[] = [
  {
    name: 'createdAt',
    type: ENUM_COLUMN_TYPES.TIMESTAMP_UTC,
    default: 'NOW()',
    isNullable: true,
  },
  {
    name: 'updatedAt',
    type: ENUM_COLUMN_TYPES.TIMESTAMP_UTC,
    isNullable: true,
  },
];

export const defaultColumns: TableColumnOptions[] = [];

export const defaultPrimaryColumn: TableColumnOptions = {
  name: 'id',
  type: ENUM_COLUMN_TYPES.PRIMARY_KEY,
  isPrimary: true,
  generationStrategy: 'uuid',
  default: 'uuid_generate_v4()',
  isUnique: true,
};
