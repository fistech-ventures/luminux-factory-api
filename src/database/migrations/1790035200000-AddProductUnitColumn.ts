import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds the `unit` column to the `products` table (kg, pcs, meter, etc.).
 *
 * Added idempotently so it is safe on databases that already have the column
 * (drift) as well as fresh ones; `migrationsRun` is enabled, so this executes
 * on the next application boot.
 */
export class AddProductUnitColumn1790035200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "products"
        ADD COLUMN IF NOT EXISTS "unit" varchar(50)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "products"
        DROP COLUMN IF EXISTS "unit"
    `);
  }
}
