import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds purchase_items.variantId so a purchase can add stock to a specific
 * ProductVariantOption (existing variants only). Nullable, mirroring the
 * productId column: plain-product purchases leave it NULL.
 */
export class AddVariantIdToPurchaseItems1788700000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "purchase_items" ADD "variantId" uuid`);
    await queryRunner.query(`
      ALTER TABLE "purchase_items"
        ADD CONSTRAINT "FK_purchase_items_variantId"
        FOREIGN KEY ("variantId") REFERENCES "product_variant_options" ("id") ON DELETE SET NULL
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_purchase_items_variantId" ON "purchase_items" ("variantId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_purchase_items_variantId"`);
    await queryRunner.query(
      `ALTER TABLE "purchase_items" DROP CONSTRAINT "FK_purchase_items_variantId"`,
    );
    await queryRunner.query(`ALTER TABLE "purchase_items" DROP COLUMN "variantId"`);
  }
}