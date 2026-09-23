import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductVariantSkus1791000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "product_variant_skus" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "isActive" boolean NOT NULL DEFAULT true,
        "createdBy" jsonb DEFAULT '{}'::jsonb,
        "updatedBy" jsonb DEFAULT '{}'::jsonb,
        "deletedBy" jsonb DEFAULT '{}'::jsonb,
        "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
        "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
        "deletedAt" timestamp without time zone,
        "productCode" varchar(100) NOT NULL UNIQUE,
        "sourcingPrice" double precision NOT NULL DEFAULT 0,
        "sellingPrice" double precision NOT NULL DEFAULT 0,
        "stockQuantity" integer NOT NULL DEFAULT 0,
        "saleQuantity" integer NOT NULL DEFAULT 0,
        "productId" uuid NOT NULL,
        PRIMARY KEY ("id"),
        CONSTRAINT "FK_product_variant_skus_productId"
          FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE CASCADE
      );
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "product_variant_sku_values" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "isActive" boolean NOT NULL DEFAULT true,
        "createdBy" jsonb DEFAULT '{}'::jsonb,
        "updatedBy" jsonb DEFAULT '{}'::jsonb,
        "deletedBy" jsonb DEFAULT '{}'::jsonb,
        "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
        "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
        "deletedAt" timestamp without time zone,
        "skuId" uuid NOT NULL,
        "variantId" uuid NOT NULL,
        "variantOptionId" uuid NOT NULL,
        PRIMARY KEY ("id"),
        CONSTRAINT "FK_product_variant_sku_values_skuId"
          FOREIGN KEY ("skuId") REFERENCES "product_variant_skus" ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_product_variant_sku_values_variantId"
          FOREIGN KEY ("variantId") REFERENCES "variants" ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_product_variant_sku_values_variantOptionId"
          FOREIGN KEY ("variantOptionId") REFERENCES "variant_options" ("id") ON DELETE CASCADE,
        CONSTRAINT "UQ_product_variant_sku_values_sku_attribute"
          UNIQUE ("skuId", "variantId"),
        CONSTRAINT "UQ_product_variant_sku_values_sku_option"
          UNIQUE ("skuId", "variantOptionId")
      );
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_product_variant_skus_productId" ON "product_variant_skus" ("productId");`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_product_variant_sku_values_skuId" ON "product_variant_sku_values" ("skuId");`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_product_variant_sku_values_variantId" ON "product_variant_sku_values" ("variantId");`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_product_variant_sku_values_variantOptionId" ON "product_variant_sku_values" ("variantOptionId");`);

    await queryRunner.query(`
      INSERT INTO "product_variant_skus"
        ("productCode", "sourcingPrice", "sellingPrice", "stockQuantity", "saleQuantity", "productId", "createdBy", "updatedBy")
      SELECT
        COALESCE(NULLIF(pvo."sku", ''), CONCAT(p."productCode", '-', LEFT(pvo."id"::text, 8))),
        p."sourcingPrice",
        pvo."sellingPrice",
        pvo."stockQuantity",
        pvo."saleQuantity",
        pvo."productId",
        pvo."createdBy",
        pvo."updatedBy"
      FROM "product_variant_options" pvo
      INNER JOIN "products" p ON p."id" = pvo."productId"
      ON CONFLICT ("productCode") DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO "product_variant_sku_values" ("skuId", "variantId", "variantOptionId", "createdBy", "updatedBy")
      SELECT sku."id", pvo."variantId", pvo."variantOptionId", pvo."createdBy", pvo."updatedBy"
      FROM "product_variant_options" pvo
      INNER JOIN "products" p ON p."id" = pvo."productId"
      INNER JOIN "product_variant_skus" sku
        ON sku."productId" = pvo."productId"
      AND sku."productCode" = COALESCE(NULLIF(pvo."sku", ''), CONCAT(p."productCode", '-', LEFT(pvo."id"::text, 8)))
      ON CONFLICT ("skuId", "variantId") DO NOTHING;
    `);
    await queryRunner.query(`
      UPDATE "products" p
      SET "stock" = totals."stock"
      FROM (
        SELECT "productId", COALESCE(SUM("stockQuantity"), 0)::integer AS "stock"
        FROM "product_variant_skus"
        GROUP BY "productId"
      ) totals
      WHERE p."id" = totals."productId";
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "product_variant_sku_values"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "product_variant_skus"`);
  }
}
