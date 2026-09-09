import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Consolidated greenfield schema migration for the showroom app.
 *
 * Rebuilds the database from scratch to match the FINAL entity model:
 *   acl (permission_types / permissions / roles), users (users / user_roles /
 *   user_profiles), product (variants / variant_options / products /
 *   product_variant_options), purchase (purchases / purchase_items), sales
 *   (sales / sale_items), customers, suppliers, expenses, ledgers, gallery,
 *   global configs and notification gateways.
 *
 * Designed to run ONCE against a freshly reset database (greenfield):
 *   psql ... -c 'DROP SCHEMA public CASCADE; CREATE SCHEMA public;'
 * then:
 *   yarn build && yarn db:migration:run -d dist/database/ormconfig.js
 * and finally seed base rows:
 *   yarn db:seed
 *
 * All tables carry the shared audit columns used by BaseEntity:
 *   id (uuid pk, uuid_generate_v4()), isActive, createdBy/updatedBy/deletedBy
 *   (jsonb), createdAt/updatedAt/deletedAt (timestamps).
 */

const BASE_COLUMNS = `
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "isActive" boolean NOT NULL DEFAULT true,
  "createdBy" jsonb DEFAULT '{}'::jsonb,
  "updatedBy" jsonb DEFAULT '{}'::jsonb,
  "deletedBy" jsonb DEFAULT '{}'::jsonb,
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
  "deletedAt" timestamp without time zone,
`;

export class CreateShowroomFinalSchema1788566400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // UUID generator used by the default of every "id" column.
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    // ------------------------------------------------------------------
    // PG enum types (used by user_profiles)
    // ------------------------------------------------------------------
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "enum_gender" AS ENUM ('male', 'female', 'other');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "enum_blood_group" AS ENUM ('a+', 'a-', 'b+', 'b-', 'ab+', 'ab-', 'o+', 'o-');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);

    // ------------------------------------------------------------------
    // ACL module
    // ------------------------------------------------------------------
    await queryRunner.query(`
      CREATE TABLE "permission_types" (
        ${BASE_COLUMNS}
        "title" varchar(100) NOT NULL UNIQUE,
        PRIMARY KEY ("id")
      );
    `);
    await queryRunner.query(`
      CREATE TABLE "permissions" (
        ${BASE_COLUMNS}
        "title" varchar(100) NOT NULL UNIQUE,
        "permissionTypeId" uuid,
        PRIMARY KEY ("id"),
        CONSTRAINT "FK_permissions_permissionTypeId"
          FOREIGN KEY ("permissionTypeId") REFERENCES "permission_types" ("id")
      );
    `);
    await queryRunner.query(`
      CREATE TABLE "roles" (
        ${BASE_COLUMNS}
        "title" varchar(100) NOT NULL UNIQUE,
        PRIMARY KEY ("id")
      );
    `);

    // ------------------------------------------------------------------
    // User module
    // ------------------------------------------------------------------
    await queryRunner.query(`
      CREATE TABLE "users" (
        ${BASE_COLUMNS}
        "fullName" varchar(225),
        "gender" varchar(225),
        "username" varchar(100) UNIQUE,
        "email" varchar(150) UNIQUE,
        "phoneNumber" varchar(20) UNIQUE,
        "avatar" text,
        "authProvider" varchar(50) NOT NULL DEFAULT 'system',
        "authProviderMetaInfo" jsonb NOT NULL DEFAULT '{}'::jsonb,
        "password" text NOT NULL,
        "isVerified" boolean DEFAULT false,
        PRIMARY KEY ("id")
      );
    `);
    await queryRunner.query(`
      CREATE TABLE "user_roles" (
        ${BASE_COLUMNS}
        "isDefault" boolean NOT NULL DEFAULT false,
        "roleId" uuid NOT NULL,
        "userId" uuid NOT NULL,
        PRIMARY KEY ("id"),
        CONSTRAINT "FK_user_roles_roleId"
          FOREIGN KEY ("roleId") REFERENCES "roles" ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_user_roles_userId"
          FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE
      );
    `);
    await queryRunner.query(`
      CREATE TABLE "role_permissions" (
        ${BASE_COLUMNS}
        "roleId" uuid NOT NULL,
        "permissionId" uuid NOT NULL,
        PRIMARY KEY ("id"),
        CONSTRAINT "FK_role_permissions_roleId"
          FOREIGN KEY ("roleId") REFERENCES "roles" ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_role_permissions_permissionId"
          FOREIGN KEY ("permissionId") REFERENCES "permissions" ("id") ON DELETE CASCADE
      );
    `);
    await queryRunner.query(`
      CREATE TABLE "user_profiles" (
        ${BASE_COLUMNS}
        "isVerified" boolean DEFAULT false,
        "code" varchar(20) NOT NULL UNIQUE,
        "fullName" varchar(255) NOT NULL,
        "email" varchar(125),
        "phoneNumber" varchar(20),
        "isThisWhatsAppNumber" boolean DEFAULT false,
        "religion" varchar(50),
        "gender" "enum_gender",
        "bloodGroup" "enum_blood_group",
        "dateOfBirth" date,
        "avatar" text,
        "introductionVideo" text,
        "address" text,
        "userId" uuid NOT NULL,
        PRIMARY KEY ("id"),
        CONSTRAINT "FK_user_profiles_userId"
          FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE
      );
    `);

    // ------------------------------------------------------------------
    // Product module (variants / variant_options / products / product_variant_options)
    // ------------------------------------------------------------------
    await queryRunner.query(`
      CREATE TABLE "variants" (
        ${BASE_COLUMNS}
        "title" varchar(256) NOT NULL UNIQUE,
        PRIMARY KEY ("id")
      );
    `);
    await queryRunner.query(`
      CREATE TABLE "variant_options" (
        ${BASE_COLUMNS}
        "title" varchar(256) NOT NULL,
        "variantId" uuid NOT NULL,
        PRIMARY KEY ("id"),
        CONSTRAINT "FK_variant_options_variantId"
          FOREIGN KEY ("variantId") REFERENCES "variants" ("id") ON DELETE CASCADE
      );
    `);
    await queryRunner.query(`
      CREATE TABLE "products" (
        ${BASE_COLUMNS}
        "title" varchar(255) NOT NULL,
        "description" text,
        "sourcingPrice" double precision NOT NULL DEFAULT 0,
        "sellingPrice" double precision NOT NULL DEFAULT 0,
        "thumbnail" text,
        "productCode" varchar(100) NOT NULL UNIQUE,
        "stock" integer NOT NULL DEFAULT 0,
        "saleQuantity" integer NOT NULL DEFAULT 0,
        "averageB2BSalesPrice" double precision NOT NULL DEFAULT 0,
        "averageB2CSalesPrice" double precision NOT NULL DEFAULT 0,
        "b2bSoldQuantity" integer NOT NULL DEFAULT 0,
        "b2cSoldQuantity" integer NOT NULL DEFAULT 0,
        PRIMARY KEY ("id")
      );
    `);
    await queryRunner.query(`
      CREATE TABLE "product_variant_options" (
        ${BASE_COLUMNS}
        "sku" varchar(256),
        "sellingPrice" double precision NOT NULL DEFAULT 0,
        "stockQuantity" integer NOT NULL DEFAULT 0,
        "saleQuantity" integer NOT NULL DEFAULT 0,
        "productId" uuid NOT NULL,
        "variantId" uuid NOT NULL,
        "variantOptionId" uuid NOT NULL,
        "position" integer NOT NULL DEFAULT 0,
        PRIMARY KEY ("id"),
        CONSTRAINT "FK_product_variant_options_productId"
          FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_product_variant_options_variantId"
          FOREIGN KEY ("variantId") REFERENCES "variants" ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_product_variant_options_variantOptionId"
          FOREIGN KEY ("variantOptionId") REFERENCES "variant_options" ("id") ON DELETE CASCADE
      );
    `);

    // ------------------------------------------------------------------
    // Customers / Suppliers
    // ------------------------------------------------------------------
    await queryRunner.query(`
      CREATE TABLE "customers" (
        ${BASE_COLUMNS}
        "name" varchar(255) NOT NULL,
        "customerType" varchar(10) NOT NULL DEFAULT 'B2C',
        "contactNumber" varchar(20) NOT NULL,
        "email" varchar(150),
        "address" text,
        "companyName" varchar(255),
        PRIMARY KEY ("id")
      );
    `);
    await queryRunner.query(`
      CREATE TABLE "suppliers" (
        ${BASE_COLUMNS}
        "companyName" varchar(255) NOT NULL,
        "contactPerson" varchar(255) NOT NULL,
        "contactNumber" varchar(20) NOT NULL,
        "email" varchar(150),
        "address" text NOT NULL,
        PRIMARY KEY ("id")
      );
    `);

    // ------------------------------------------------------------------
    // Purchase module
    // ------------------------------------------------------------------
    await queryRunner.query(`
      CREATE TABLE "purchases" (
        ${BASE_COLUMNS}
        "purchaseDate" date NOT NULL,
        "purchaseType" varchar(100) NOT NULL,
        "supplierId" uuid NOT NULL,
        "totalQuantity" integer NOT NULL DEFAULT 0,
        "totalPurchaseAmount" double precision NOT NULL DEFAULT 0,
        "paidAmount" double precision NOT NULL DEFAULT 0,
        "paymentMethod" varchar(100) NOT NULL,
        "dueAmount" double precision NOT NULL DEFAULT 0,
        "purchasedById" uuid NOT NULL,
        PRIMARY KEY ("id"),
        CONSTRAINT "FK_purchases_supplierId"
          FOREIGN KEY ("supplierId") REFERENCES "suppliers" ("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_purchases_purchasedById"
          FOREIGN KEY ("purchasedById") REFERENCES "users" ("id") ON DELETE RESTRICT
      );
    `);
    await queryRunner.query(`
      CREATE TABLE "purchase_items" (
        ${BASE_COLUMNS}
        "purchaseId" uuid NOT NULL,
        "productId" uuid,
        "productName" varchar(255),
        "quantity" integer NOT NULL,
        "totalProductCost" double precision NOT NULL,
        "otherCost" double precision NOT NULL DEFAULT 0,
        "calculatedSourcingPrice" double precision NOT NULL,
        PRIMARY KEY ("id"),
        CONSTRAINT "FK_purchase_items_purchaseId"
          FOREIGN KEY ("purchaseId") REFERENCES "purchases" ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_purchase_items_productId"
          FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE SET NULL
      );
    `);

    // ------------------------------------------------------------------
    // Sales module
    // ------------------------------------------------------------------
    await queryRunner.query(`
      CREATE TABLE "sales" (
        ${BASE_COLUMNS}
        "date" date NOT NULL,
        "customerId" uuid NOT NULL,
        "totalAmount" double precision NOT NULL DEFAULT 0,
        "discount" double precision NOT NULL DEFAULT 0,
        "grandTotal" double precision NOT NULL DEFAULT 0,
        "paidAmount" double precision NOT NULL DEFAULT 0,
        "paymentMethod" varchar(100) NOT NULL,
        "dueAmount" double precision NOT NULL DEFAULT 0,
        "soldById" uuid NOT NULL,
        PRIMARY KEY ("id"),
        CONSTRAINT "FK_sales_customerId"
          FOREIGN KEY ("customerId") REFERENCES "customers" ("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_sales_soldById"
          FOREIGN KEY ("soldById") REFERENCES "users" ("id") ON DELETE RESTRICT
      );
    `);
    await queryRunner.query(`
      CREATE TABLE "sale_items" (
        ${BASE_COLUMNS}
        "saleId" uuid NOT NULL,
        "productId" uuid NOT NULL,
        "variantId" uuid,
        "quantity" integer NOT NULL,
        "sellingPrice" double precision NOT NULL,
        "sourcingPrice" double precision NOT NULL DEFAULT 0,
        "totalAmount" double precision NOT NULL,
        PRIMARY KEY ("id"),
        CONSTRAINT "FK_sale_items_saleId"
          FOREIGN KEY ("saleId") REFERENCES "sales" ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_sale_items_productId"
          FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_sale_items_variantId"
          FOREIGN KEY ("variantId") REFERENCES "product_variant_options" ("id") ON DELETE RESTRICT
      );
    `);

    // ------------------------------------------------------------------
    // Ledger / Expense
    // ------------------------------------------------------------------
    await queryRunner.query(`
      CREATE TABLE "ledgers" (
        ${BASE_COLUMNS}
        "entityType" varchar(50) NOT NULL,
        "entityId" varchar(255) NOT NULL,
        "type" varchar(50) NOT NULL,
        "amount" double precision NOT NULL,
        "referenceId" varchar(255),
        "referenceType" varchar(50),
        "description" text,
        "transactionDate" date NOT NULL,
        PRIMARY KEY ("id")
      );
    `);
    await queryRunner.query(`
      CREATE TABLE "expenses" (
        ${BASE_COLUMNS}
        "date" date NOT NULL,
        "purpose" varchar(255) NOT NULL,
        "amountSpent" double precision NOT NULL,
        "paymentMethod" varchar(100) NOT NULL,
        "spentBy" varchar(255) NOT NULL,
        PRIMARY KEY ("id")
      );
    `);
    await queryRunner.query(`
      CREATE TABLE "payments" (
        ${BASE_COLUMNS}
        "paymentDate" date NOT NULL,
        "entityType" varchar(50) NOT NULL,
        "entityId" varchar(255) NOT NULL,
        "amount" double precision NOT NULL,
        "paymentMethod" varchar(100) NOT NULL,
        "referenceId" varchar(255),
        "referenceType" varchar(50),
        "note" text,
        PRIMARY KEY ("id")
      );
    `);

    // ------------------------------------------------------------------
    // Gallery / Global configs
    // ------------------------------------------------------------------
    await queryRunner.query(`
      CREATE TABLE "gallery" (
        ${BASE_COLUMNS}
        "title" varchar(255),
        "caption" varchar(255),
        "source" varchar(255),
        "altText" varchar(255),
        "url" text NOT NULL,
        "key" varchar(255) NOT NULL,
        "mimetype" varchar(50) NOT NULL,
        "extension" varchar(10) NOT NULL,
        PRIMARY KEY ("id")
      );
    `);
    await queryRunner.query(`
      CREATE TABLE "global_configs" (
        ${BASE_COLUMNS}
        "name" varchar(255),
        "initialName" varchar(255),
        "icon" text,
        "logo" text,
        "themePrimaryColor" varchar(255),
        "themeSecondayColor" varchar(255),
        "phoneCode" varchar(255),
        "currency" varchar(255),
        "description" text,
        "phone" varchar(255),
        "address" text,
        "socialUrls" jsonb,
        "allowUserRegistration" boolean DEFAULT true,
        "userRegistrationVerificationRequired" boolean DEFAULT false,
        "needWebView" boolean DEFAULT true,
        "otpExpiresInMin" integer DEFAULT 5,
        PRIMARY KEY ("id")
      );
    `);
    await queryRunner.query(`
      CREATE TABLE "analytics_configs" (
        ${BASE_COLUMNS}
        "trackingScripts" jsonb DEFAULT '[]'::jsonb,
        PRIMARY KEY ("id")
      );
    `);

    // ------------------------------------------------------------------
    // Notification module
    // ------------------------------------------------------------------
    await queryRunner.query(`
      CREATE TABLE "sms_gateways" (
        ${BASE_COLUMNS}
        "title" varchar(225) NOT NULL,
        "accountType" varchar(50) NOT NULL DEFAULT 'default',
        "requestMethod" varchar(50) NOT NULL,
        "requestEndpoint" text NOT NULL,
        "requestBody" jsonb,
        "userId" uuid,
        PRIMARY KEY ("id"),
        CONSTRAINT "FK_sms_gateways_userId"
          FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE
      );
    `);
    await queryRunner.query(`
      CREATE TABLE "email_gateways" (
        ${BASE_COLUMNS}
        "title" varchar(225) NOT NULL,
        "accountType" varchar(50) NOT NULL DEFAULT 'default',
        "type" varchar(50),
        "host" varchar(100) NOT NULL,
        "port" integer NOT NULL,
        "isSecure" boolean NOT NULL,
        "authUser" varchar(100) NOT NULL,
        "authPassword" varchar(100) NOT NULL,
        "senderEmail" varchar(100) NOT NULL,
        "senderLabel" varchar(100),
        "userId" uuid,
        PRIMARY KEY ("id"),
        CONSTRAINT "FK_email_gateways_userId"
          FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE
      );
    `);

    // ------------------------------------------------------------------
    // Indexes matching the entity @Index decorators
    // ------------------------------------------------------------------
    await queryRunner.query(`CREATE INDEX "IDX_product_variant_options_productId" ON "product_variant_options" ("productId");`);
    await queryRunner.query(`CREATE INDEX "IDX_product_variant_options_variantId" ON "product_variant_options" ("variantId");`);
    await queryRunner.query(`CREATE INDEX "IDX_product_variant_options_variantOptionId" ON "product_variant_options" ("variantOptionId");`);

    await queryRunner.query(`CREATE INDEX "IDX_purchases_supplierId" ON "purchases" ("supplierId");`);
    await queryRunner.query(`CREATE INDEX "IDX_purchases_purchasedById" ON "purchases" ("purchasedById");`);
    await queryRunner.query(`CREATE INDEX "IDX_purchase_items_purchaseId" ON "purchase_items" ("purchaseId");`);
    await queryRunner.query(`CREATE INDEX "IDX_purchase_items_productId" ON "purchase_items" ("productId");`);

    await queryRunner.query(`CREATE INDEX "IDX_sales_customerId" ON "sales" ("customerId");`);
    await queryRunner.query(`CREATE INDEX "IDX_sales_soldById" ON "sales" ("soldById");`);
    await queryRunner.query(`CREATE INDEX "IDX_sale_items_saleId" ON "sale_items" ("saleId");`);
    await queryRunner.query(`CREATE INDEX "IDX_sale_items_productId" ON "sale_items" ("productId");`);
    await queryRunner.query(`CREATE INDEX "IDX_sale_items_variantId" ON "sale_items" ("variantId");`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop in reverse dependency order.
    const tables = [
      'email_gateways',
      'sms_gateways',
      'analytics_configs',
      'global_configs',
      'gallery',
      'expenses',
      'ledgers',
      'payments',
      'sale_items',
      'sales',
      'purchase_items',
      'purchases',
      'suppliers',
      'customers',
      'product_variant_options',
      'products',
      'variant_options',
      'variants',
      'user_profiles',
      'role_permissions',
      'user_roles',
      'users',
      'roles',
      'permissions',
      'permission_types',
    ];
    for (const table of tables) {
      await queryRunner.query(`DROP TABLE IF EXISTS "${table}" CASCADE;`);
    }

    await queryRunner.query(`DROP TYPE IF EXISTS "enum_gender";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "enum_blood_group";`);
  }
}
