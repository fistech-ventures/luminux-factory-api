import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Reconciles the shipping columns of the `sales` table with the `Sale` entity.
 *
 * `AddShippingColumnsToSales1789710278981` and
 * `RefactorShippingAddress1789843068883` are recorded as executed in the
 * `migrations` table, but some databases drifted:
 *
 *   - `shippingTo` / `shippingContact` are missing, which makes every Sale
 *     query fail with `column Sale.shippingTo does not exist`;
 *   - `shippingAddress` is still the legacy `jsonb` column
 *     (`{ name, contactNumber, address }`) while the entity and
 *     `sale.service` now read and write a plain string.
 *
 * Both are repaired idempotently, so the migration is safe to run on databases
 * that are already correct (it simply does nothing there).
 */
export class ReconcileShippingColumns1789845530659 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "sales"
        ADD COLUMN IF NOT EXISTS "shippingTo" varchar(255) NOT NULL DEFAULT '',
        ADD COLUMN IF NOT EXISTS "shippingAddress" varchar,
        ADD COLUMN IF NOT EXISTS "shippingContact" varchar(255)
    `);

    // Convert the legacy jsonb column to a string, keeping the address part of
    // the stored object. Skipped when the column is already a varchar.
    await queryRunner.query(`
      DO $$
      BEGIN
        IF (
          SELECT data_type FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'sales' AND column_name = 'shippingAddress'
        ) IN ('jsonb', 'json') THEN
          ALTER TABLE "sales" ALTER COLUMN "shippingAddress" TYPE varchar USING (
            CASE
              WHEN jsonb_typeof("shippingAddress") = 'object' THEN "shippingAddress" ->> 'address'
              ELSE "shippingAddress"::text
            END
          );
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "sales"
        DROP COLUMN IF EXISTS "shippingTo",
        DROP COLUMN IF EXISTS "shippingAddress",
        DROP COLUMN IF EXISTS "shippingContact"
    `);
  }
}
