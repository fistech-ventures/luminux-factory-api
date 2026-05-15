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
  USER_ADDRESSES = 'user_addresses',
  USER_MEMBERSHIPS = 'user_memberships',
  USER_ROLES = 'user_roles',
  ROLE_PERMISSIONS = 'role_permissions',

  USER_WISHLISTS = 'user_wishlists',

  // notification module tables
  SMS_GATEWAYS = 'sms_gateways',
  EMAIL_GATEWAYS = 'email_gateways',

  // common tables
  CITIES = 'cities',
  DELIVERY_CHARGE = 'delivery_charges',
  AREAS = 'areas',
  QUOTES = 'quotes',

  // payment module tables
  PAYMENTS = 'payments',
  PAYMENT_GATEWAYS = 'payment_gateways',
  PAYMENT_ACCOUNTS = 'payment_accounts',
  PAYMENT_GATEWAY_LOGS = 'payment_gateway_logs',
  USER_TRANSACTIONS = 'user_transactions',
  USER_INVOICES = 'user_invoices',
  ORG_TRANSACTIONS = 'organization_transactions',
  TRANSACTION_SOURCES = 'transaction_sources',

  // Product module tables
  AUTHORS = 'authors',
  PUBLICATIONS = 'publications',
  GENRES = 'genres',
  TAGS = 'tags',
  VARIANTS = 'variants',
  VARIANT_OPTIONS = 'variant_options',
  CATEGORIES = 'categories',
  BRANDS = 'brands',
  SOURCE_SHOPS = 'source_shops',
  PRODUCTS = 'products',
  PRODUCT_NEW_ARRIVED = 'product_new_arrived',
  PRODUCT_VARIANT_OPTIONS = 'product_variant_options',
  PRODUCT_TAGS = 'product_tags',
  PRODUCT_GENRES = 'product_genres',
  PRODUCT_CATEGORIES = 'product_categories',
  PRODUCT_MEDIAS = 'product_medias',
  PRODUCT_QUESTIONS = 'product_questions',
  PRODUCT_QUESTION_ANSWERS = 'product_question_answers',
  PRODUCT_REVIEWS = 'product_reviews',
  PRODUCT_REQUESTS = 'product_requests',

  // Order
  ORDERS = 'orders',
  ORDER_ITEMS = 'order_items',
  ORDER_STATUSES = 'order_statuses',
  CARTS = 'carts',
  CART_ITEMS = 'cart_items',

  // CMS 
  MENUS = 'menus',
  HERO_BANNERS = 'hero_banners',
  PAGES = 'pages',
  SECTIONS = 'sections',
  SECTION_ITEMS = 'section_items',
  PAGE_SECTIONS = 'page_sections',
  FORMS = 'forms',
  FORM_SUBMITS = 'form_submits',
  REVIEWS = 'reviews',

  // Support 
  FEEDBACKS = 'feedbacks',
  PANEL_TRAININGS = 'panel_trainings',

  // config
  CACHE_KEYS = 'cache_keys',

  SERVICE_PROVIDER = 'service_providers',
  PROVIDER_SERVICE_REQUESTS = 'provider_service_requests',
  NOTES = 'notes',

  // Offers module tables
  OFFERS = 'offers',
  DISCOUNT_RULES = 'discount_rules',
  OFFER_SCOPES = 'offer_scopes',
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
