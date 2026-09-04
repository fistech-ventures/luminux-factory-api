import { toBool, toNumber } from '@src/shared';
import { config } from 'dotenv';
import * as path from 'path';

config({
  path: path.join(process.cwd(), 'environments', `${process.env.NODE_ENV || 'development'}.env`),
});

export const ENV_DEVELOPMENT = 'development';
export const ENV_PRODUCTION = 'production';
export const ENV_STAGING = 'staging';
export const ENV_QA = 'qa';

export const ENV = {
  port: process.env.PORT,
  env: process.env.NODE_ENV || ENV_DEVELOPMENT,
  appIdentifier: process.env.APP_IDENTIFIER || 'local-single-vendor-ecom',
  appTitle: process.env.APP_TITLE || 'local-single-vendor-ecom',
  isProduction: process.env.NODE_ENV === ENV_PRODUCTION,
  isStaging: process.env.NODE_ENV === ENV_STAGING,
  isTest: process.env.NODE_ENV === ENV_QA,
  isDevelopment: process.env.NODE_ENV === ENV_DEVELOPMENT,

  api: {
    API_PREFIX: process.env.API_PREFIX,
    API_VERSION: process.env.API_VERSION,
    API_TITLE: process.env.API_TITLE,
    API_DESCRIPTION: process.env.API_DESCRIPTION,
  },

  security: {
    CORS_ALLOWED_ORIGINS: process.env.CORS_ALLOWED_ORIGINS?.split(',').map((item) => item?.trim()),
    RATE_LIMIT_TTL: toNumber(process.env.RATE_LIMIT_TTL),
    RATE_LIMIT_MAX: toNumber(process.env.RATE_LIMIT_MAX),
    skipSecuirity: toBool(process.env.SKIP_SECURITY),
  },

  logger: {
    LOG_FOLDER: process.env.LOG_FOLDER,
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    secretForAccountVerification: process.env.JWT_SECRET_FOR_ACCOUNT_VERIFICATION,
    secretForResetPassword: process.env.JWT_SECRET_FOR_RESET_PASSWORD,
    saltRound: toNumber(process.env.JWT_SALT_ROUNDS),
    tokenExpireIn: process.env.JWT_EXPIRES_IN,
    refreshTokenExpireIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN,
  },

  db: {
    type: process.env.DB_TYPE,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,

    synchronize: toBool(process.env.DB_SYNCHRONIZE),
    logging: toBool(process.env.DB_LOGGING),
  },

  redis: {
    queue: {
      host: process.env.QUEUE_HOST,
      port: toNumber(process.env.QUEUE_PORT),
      password: process.env.QUEUE_PASSWORD,
      username: process.env.QUEUE_USERNAME,
    },
    cache: {
      isEnabled: toBool(process.env.CACHE_API_DATA),
      ttl: toNumber(process.env.CACHE_TTL),
      max: toNumber(process.env.CACHE_MAX),
      storeHost: process.env.CACHE_STORE_HOST,
      storePort: toNumber(process.env.CACHE_STORE_PORT),
      storePassword: process.env.CACHE_STORE_PASSWORD,
      storeUsername: process.env.CACHE_STORE_USERNAME,
    },
  },
  auth: {
    otpExpireIn: toNumber(process.env.OTP_EXPIRES_IN),
    skipAuth: toBool(process.env.SKIP_AUTH),
  },
  r2: {
    accountId: process.env.R2_ACCOUNT_ID,
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    bucketName: process.env.R2_BUCKET_NAME,
    publicDomain: process.env.R2_PUBLIC_DOMAIN,
  },

  mail: {
    gmail: {
      clientId: process.env.GMAIL_CLIENT_ID,
      clientSecret: process.env.GMAIL_CLIENT_SECRET,
      tokens: {
        access_token: process.env.GMAIL_ACCESS_TOKEN,
        refresh_token: process.env.GMAIL_REFRESH_TOKEN,
        scope: 'https://www.googleapis.com/auth/gmail.send',
        token_type: 'Bearer',
        expiry_date: 1683057125997,
      },
    },
    smtp: {
      host: process.env.SMTP_HOST,
      port: toNumber(process.env.SMTP_PORT),
      secure: toBool(process.env.SMTP_SECURE),
      auth: {
        user: process.env.SMTP_AUTH_USER,
        pass: process.env.SMTP_AUTH_PASS,
      },
    },
  },
  seedData: {
    superAdminEmail: process.env.SUPER_ADMIN_EMAIL,
    superAdminPassword: process.env.SUPER_ADMIN_PASSWORD,
  },
  sso: {
    webLoginUrl: process.env.SSO_WEB_LOGIN_URL,
  },
  authenticator: {
    google: {
      issuer: process.env.GOOGLE_AUTHENTICATOR_ISSUER,
    },
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    secret: process.env.GOOGLE_SECRET,
    redirectUrl: process.env.GOOGLE_REDIRECT_URL,
  },
  facebook: {
    apiVersion: process.env.FB_API_VERSION,
    clientId: process.env.FACEBOOK_CLIENT_ID,
    secret: process.env.FACEBOOK_SECRET,
    redirectUrl: process.env.FACEBOOK_REDIRECT_URL,
    configId: process.env.FACEBOOK_CONFIG_ID,
  },
  policy: {
    supportEmailAddress: process.env.SUPPORT_EMAIL_ADDRESS,
  },
  sslCommerz: {
    SSL_COMMERZ_BASE_PAYMENT_URL: process.env.SSL_COMMERZ_BASE_PAYMENT_URL,
    SSL_COMMERZ_BASE_PAYMENT_VALIDATION_URL: process.env.SSL_COMMERZ_BASE_PAYMENT_VALIDATION_URL,
    SSL_COMMERZ_STORE_ID: process.env.SSL_COMMERZ_STORE_ID,
    SSL_COMMERZ_STORE_PASSWORD: process.env.SSL_COMMERZ_STORE_PASSWORD,
    SSL_COMMERZ_SUCCESS_URL: process.env.SSL_COMMERZ_SUCCESS_URL,
    SSL_COMMERZ_FAILED_URL: process.env.SSL_COMMERZ_FAILED_URL,
    SSL_COMMERZ_CANCELED_URL: process.env.SSL_COMMERZ_CANCELED_URL,
    SSL_COMMERZ_REQUEST_TYPE: process.env.SSL_COMMERZ_REQUEST_TYPE,
    SSL_COMMERZ_CURRENCY: process.env.SSL_COMMERZ_CURRENCY,
  },
  bkash: {
    BKASH_TOKEN_URL: process.env.BKASH_TOKEN_URL,
    BKASH_CREATE_URL: process.env.BKASH_CREATE_URL,
    BKASH_EXECUTE_URL: process.env.BKASH_EXECUTE_URL,
    BKASH_PAYMENT_STATUS_URL: process.env.BKASH_PAYMENT_STATUS_URL,
    BKASH_SEARCH_TRANSACTION_URL: process.env.BKASH_SEARCH_TRANSACTION_URL,
    BKASH_REFUND_TRANSACTION_URL: process.env.BKASH_REFUND_TRANSACTION_URL,
    BKASH_APP_KEY: process.env.BKASH_APP_KEY,
    BKASH_APP_SECRET: process.env.BKASH_APP_SECRET,
    BKASH_USERNAME: process.env.BKASH_USERNAME,
    BKASH_PASSWORD: process.env.BKASH_PASSWORD,
    BKASH_WEB_HOOK_URL: process.env.BKASH_WEB_HOOK_URL,
  },
  externalApis: {
    paymentKitApiEndpoint: process.env.CORE_API_ENDPOINT,
    coreApiEndpoint: process.env.CORE_API_ENDPOINT,
  },
  externalUrls: {
    webUrl: process.env.WEB_URL,
  },

  systemConfig: {
    productCodePrefix: process.env.PRODUCT_CODE_PREFIX || 'FIBO',
    membershipCodePrefix: process.env.MEMBERSHIP_CODE_PREFIX || 'FIBO',
    orderInvoiceTemplate: process.env.ODER_INVOICE_TEMPLATE || 'fibo-order-invoice',
    contact: {
      phone1: '',
      phone2: '',
      email: '',
      address: '',
      logo: '',
    },
  },
};

export const ormConfig = {
  type: ENV.db.type,
  host: ENV.db.host,
  port: +ENV.db.port,
  username: ENV.db.username,
  password: ENV.db.password,
  database: ENV.db.database,
  synchronize: ENV.db.synchronize,
  logging: ENV.db.logging,
  autoLoadEntities: true,
};
