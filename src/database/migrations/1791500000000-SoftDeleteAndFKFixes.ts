import { MigrationInterface, QueryRunner } from 'typeorm';

export class SoftDeleteAndFKFixes1791500000000 implements MigrationInterface {
  name = 'SoftDeleteAndFKFixes1791500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Add isDeleted columns
    await queryRunner.query(`
      ALTER TABLE "variant_options"
      ADD COLUMN IF NOT EXISTS "isDeleted" boolean NOT NULL DEFAULT false
    `);
    await queryRunner.query(`
      ALTER TABLE "product_variant_options"
      ADD COLUMN IF NOT EXISTS "isDeleted" boolean NOT NULL DEFAULT false
    `);
    await queryRunner.query(`
      ALTER TABLE "product_variant_skus"
      ADD COLUMN IF NOT EXISTS "isDeleted" boolean NOT NULL DEFAULT false
    `);
    await queryRunner.query(`
      ALTER TABLE "product_variant_sku_values"
      ADD COLUMN IF NOT EXISTS "isDeleted" boolean NOT NULL DEFAULT false
    `);

    // 2. Fix FK on product_variant_options.variantOptionId: CASCADE -> RESTRICT
    await queryRunner.query(`
      ALTER TABLE "product_variant_options"
      DROP CONSTRAINT IF EXISTS "FK_product_variant_options_variantOptionId"
    `);
    await queryRunner.query(`
      ALTER TABLE "product_variant_options"
      ADD CONSTRAINT "FK_product_variant_options_variantOptionId"
        FOREIGN KEY ("variantOptionId") REFERENCES "variant_options" ("id") ON DELETE RESTRICT
    `);

    // 3. Fix FK on product_variant_options.variantId: CASCADE -> RESTRICT
    await queryRunner.query(`
      ALTER TABLE "product_variant_options"
      DROP CONSTRAINT IF EXISTS "FK_product_variant_options_variantId"
    `);
    await queryRunner.query(`
      ALTER TABLE "product_variant_options"
      ADD CONSTRAINT "FK_product_variant_options_variantId"
        FOREIGN KEY ("variantId") REFERENCES "variants" ("id") ON DELETE RESTRICT
    `);

    // 4. Fix FK on product_variant_sku_values.variantOptionId: CASCADE -> RESTRICT
    await queryRunner.query(`
      ALTER TABLE "product_variant_sku_values"
      DROP CONSTRAINT IF EXISTS "FK_product_variant_sku_values_variantOptionId"
    `);
    await queryRunner.query(`
      ALTER TABLE "product_variant_sku_values"
      ADD CONSTRAINT "FK_product_variant_sku_values_variantOptionId"
        FOREIGN KEY ("variantOptionId") REFERENCES "variant_options" ("id") ON DELETE RESTRICT
    `);

    // 5. Fix FK on product_variant_sku_values.variantId: CASCADE -> RESTRICT
    await queryRunner.query(`
      ALTER TABLE "product_variant_sku_values"
      DROP CONSTRAINT IF EXISTS "FK_product_variant_sku_values_variantId"
    `);
    await queryRunner.query(`
      ALTER TABLE "product_variant_sku_values"
      ADD CONSTRAINT "FK_product_variant_sku_values_variantId"
        FOREIGN KEY ("variantId") REFERENCES "variants" ("id") ON DELETE RESTRICT
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert FK changes back to CASCADE (for rollback only)
    await queryRunner.query(`
      ALTER TABLE "product_variant_sku_values"
      DROP CONSTRAINT IF EXISTS "FK_product_variant_sku_values_variantId"
    `);
    await queryRunner.query(`
      ALTER TABLE "product_variant_sku_values"
      ADD CONSTRAINT "FK_product_variant_sku_values_variantId"
        FOREIGN KEY ("variantId") REFERENCES "variants" ("id") ON DELETE CASCADE
    `);
    await queryRunner.query(`
      ALTER TABLE "product_variant_sku_values"
      DROP CONSTRAINT IF EXISTS "FK_product_variant_sku_values_variantOptionId"
    `);
    await queryRunner.query(`
      ALTER TABLE "product_variant_sku_values"
      ADD CONSTRAINT "FK_product_variant_sku_values_variantOptionId"
        FOREIGN KEY ("variantOptionId") REFERENCES "variant_options" ("id") ON DELETE CASCADE
    `);
    await queryRunner.query(`
      ALTER TABLE "product_variant_options"
      DROP CONSTRAINT IF EXISTS "FK_product_variant_options_variantId"
    `);
    await queryRunner.query(`
      ALTER TABLE "product_variant_options"
      ADD CONSTRAINT "FK_product_variant_options_variantId"
        FOREIGN KEY ("variantId") REFERENCES "variants" ("id") ON DELETE CASCADE
    `);
    await queryRunner.query(`
      ALTER TABLE "product_variant_options"
      DROP CONSTRAINT IF EXISTS "FK_product_variant_options_variantOptionId"
    `);
    await queryRunner.query(`
      ALTER TABLE "product_variant_options"
      ADD CONSTRAINT "FK_product_variant_options_variantOptionId"
        FOREIGN KEY ("variantOptionId") REFERENCES "variant_options" ("id") ON DELETE CASCADE
    `);
    // Remove isDeleted columns
    await queryRunner.query(`ALTER TABLE "product_variant_sku_values" DROP COLUMN IF EXISTS "isDeleted"`);
    await queryRunner.query(`ALTER TABLE "product_variant_skus" DROP COLUMN IF EXISTS "isDeleted"`);
    await queryRunner.query(`ALTER TABLE "product_variant_options" DROP COLUMN IF EXISTS "isDeleted"`);
    await queryRunner.query(`ALTER TABLE "variant_options" DROP COLUMN IF EXISTS "isDeleted"`);
  }
}
