import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Incremental migration on top of the consolidated schema for the
 * accounts / profit / dashboard features:
 *
 *   1. Creates the "payments" table when it is missing - databases created
 *      from an earlier version of the consolidated migration don't have it
 *      yet, which breaks the accounts module.
 *   2. Adds customerType (B2B / B2C) to customers.
 *   3. Adds the auto-calculated B2B / B2C average selling price fields
 *      (and sold-quantity counters) to products.
 *   4. Adds the sourcing price snapshot column to sale_items so profit can
 *      be calculated from the cost at the time of sale.
 *
 * All statements are idempotent (IF NOT EXISTS) so it can safely run on
 * both fresh and already-migrated databases.
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

export class AddAccountsProfitAndCustomerType1788900000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "payments" (
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

    // Databases created from an earlier consolidated migration are also
    // missing the paymentMethod column on purchases / expenses.
    await queryRunner.query(
      `ALTER TABLE "purchases" ADD COLUMN IF NOT EXISTS "paymentMethod" varchar(100) NOT NULL DEFAULT 'cash';`,
    );
    await queryRunner.query(
      `ALTER TABLE "expenses" ADD COLUMN IF NOT EXISTS "paymentMethod" varchar(100) NOT NULL DEFAULT 'cash';`,
    );

    await queryRunner.query(
      `ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "customerType" varchar(10) NOT NULL DEFAULT 'B2C';`,
    );

    await queryRunner.query(
      `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "averageB2BSalesPrice" double precision NOT NULL DEFAULT 0;`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "averageB2CSalesPrice" double precision NOT NULL DEFAULT 0;`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "b2bSoldQuantity" integer NOT NULL DEFAULT 0;`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "b2cSoldQuantity" integer NOT NULL DEFAULT 0;`,
    );

    await queryRunner.query(
      `ALTER TABLE "sale_items" ADD COLUMN IF NOT EXISTS "sourcingPrice" double precision NOT NULL DEFAULT 0;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "sale_items" DROP COLUMN IF EXISTS "sourcingPrice";`);
    await queryRunner.query(`ALTER TABLE "expenses" DROP COLUMN IF EXISTS "paymentMethod";`);
    await queryRunner.query(`ALTER TABLE "purchases" DROP COLUMN IF EXISTS "paymentMethod";`);
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN IF EXISTS "b2cSoldQuantity";`);
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN IF EXISTS "b2bSoldQuantity";`);
    await queryRunner.query(
      `ALTER TABLE "products" DROP COLUMN IF EXISTS "averageB2CSalesPrice";`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" DROP COLUMN IF EXISTS "averageB2BSalesPrice";`,
    );
    await queryRunner.query(`ALTER TABLE "customers" DROP COLUMN IF EXISTS "customerType";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "payments" CASCADE;`);
  }
}