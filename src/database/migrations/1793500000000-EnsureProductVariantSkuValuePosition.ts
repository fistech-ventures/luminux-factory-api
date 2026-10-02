import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnsureProductVariantSkuValuePosition1793500000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE IF EXISTS "product_variant_sku_values"
      ADD COLUMN IF NOT EXISTS "position" integer NOT NULL DEFAULT 0;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE IF EXISTS "product_variant_sku_values"
      DROP COLUMN IF EXISTS "position";
    `);
  }
}