import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSkuIdsToTransactionItems1791000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "purchase_items" ADD COLUMN IF NOT EXISTS "skuId" uuid`);
    await queryRunner.query(`ALTER TABLE "sale_items" ADD COLUMN IF NOT EXISTS "skuId" uuid`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_purchase_items_skuId" ON "purchase_items" ("skuId")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_sale_items_skuId" ON "sale_items" ("skuId")`);
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "purchase_items"
          ADD CONSTRAINT "FK_purchase_items_skuId"
          FOREIGN KEY ("skuId") REFERENCES "product_variant_skus" ("id") ON DELETE SET NULL;
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "sale_items"
          ADD CONSTRAINT "FK_sale_items_skuId"
          FOREIGN KEY ("skuId") REFERENCES "product_variant_skus" ("id") ON DELETE RESTRICT;
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "sale_items" DROP CONSTRAINT "FK_sale_items_skuId"`);
    await queryRunner.query(`ALTER TABLE "purchase_items" DROP CONSTRAINT "FK_purchase_items_skuId"`);
    await queryRunner.query(`DROP INDEX "IDX_sale_items_skuId"`);
    await queryRunner.query(`DROP INDEX "IDX_purchase_items_skuId"`);
    await queryRunner.query(`ALTER TABLE "sale_items" DROP COLUMN "skuId"`);
    await queryRunner.query(`ALTER TABLE "purchase_items" DROP COLUMN "skuId"`);
  }
}