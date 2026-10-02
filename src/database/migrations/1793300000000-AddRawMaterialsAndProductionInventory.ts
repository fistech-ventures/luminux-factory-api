import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRawMaterialsAndProductionInventory1793300000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "purchase_items" ALTER COLUMN "quantity" TYPE double precision;`);
    await queryRunner.query(`ALTER TABLE "purchases" ALTER COLUMN "totalQuantity" TYPE double precision;`);
    await queryRunner.query(`ALTER TABLE "sale_items" ALTER COLUMN "quantity" TYPE double precision;`);
    await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "stock" TYPE double precision;`);
    await queryRunner.query(`
      CREATE TABLE "raw_materials" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "isActive" boolean NOT NULL DEFAULT true,
        "createdBy" jsonb DEFAULT '{}'::jsonb,
        "updatedBy" jsonb DEFAULT '{}'::jsonb,
        "deletedBy" jsonb DEFAULT '{}'::jsonb,
        "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
        "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
        "deletedAt" timestamp without time zone,
        "isDeleted" boolean NOT NULL DEFAULT false,
        "title" varchar(255) NOT NULL,
        "description" text,
        "unit" varchar(50),
        "warranty" text,
        "sourcingPrice" double precision NOT NULL DEFAULT 0,
        "sellingPrice" double precision NOT NULL DEFAULT 0,
        "image" text,
        "stock" double precision NOT NULL DEFAULT 0,
        "saleQuantity" double precision NOT NULL DEFAULT 0,
        PRIMARY KEY ("id")
      );
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_raw_materials_title" ON "raw_materials" ("title");`,
    );
    await queryRunner.query(`
      CREATE TABLE "raw_material_combinations" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "isActive" boolean NOT NULL DEFAULT true,
        "createdBy" jsonb DEFAULT '{}'::jsonb,
        "updatedBy" jsonb DEFAULT '{}'::jsonb,
        "deletedBy" jsonb DEFAULT '{}'::jsonb,
        "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
        "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
        "deletedAt" timestamp without time zone,
        "isDeleted" boolean NOT NULL DEFAULT false,
        "rawMaterialId" uuid NOT NULL,
        "title" varchar(255) NOT NULL,
        "code" varchar(100),
        "unit" varchar(50),
        "sourcingPrice" double precision NOT NULL DEFAULT 0,
        "sellingPrice" double precision NOT NULL DEFAULT 0,
        "stock" double precision NOT NULL DEFAULT 0,
        "saleQuantity" double precision NOT NULL DEFAULT 0,
        PRIMARY KEY ("id"),
        CONSTRAINT "FK_raw_material_combinations_rawMaterialId"
          FOREIGN KEY ("rawMaterialId") REFERENCES "raw_materials" ("id") ON DELETE RESTRICT
      );
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_raw_material_combinations_rawMaterialId" ON "raw_material_combinations" ("rawMaterialId");`,
    );
    await queryRunner.query(`
      ALTER TABLE "purchase_items"
        ADD COLUMN "itemType" varchar(20) NOT NULL DEFAULT 'product',
        ADD COLUMN "rawMaterialId" uuid,
        ADD COLUMN "rawMaterialCombinationId" uuid,
        ADD CONSTRAINT "FK_purchase_items_rawMaterialId"
          FOREIGN KEY ("rawMaterialId") REFERENCES "raw_materials" ("id") ON DELETE SET NULL,
        ADD CONSTRAINT "FK_purchase_items_rawMaterialCombinationId"
          FOREIGN KEY ("rawMaterialCombinationId") REFERENCES "raw_material_combinations" ("id") ON DELETE RESTRICT;
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_purchase_items_rawMaterialId" ON "purchase_items" ("rawMaterialId");`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_purchase_items_rawMaterialCombinationId" ON "purchase_items" ("rawMaterialCombinationId");`,
    );
    await queryRunner.query(`
      ALTER TABLE "sale_items"
        ALTER COLUMN "productId" DROP NOT NULL,
        ADD COLUMN "itemType" varchar(20) NOT NULL DEFAULT 'product',
        ADD COLUMN "rawMaterialId" uuid,
        ADD COLUMN "rawMaterialCombinationId" uuid,
        ADD CONSTRAINT "FK_sale_items_rawMaterialId"
          FOREIGN KEY ("rawMaterialId") REFERENCES "raw_materials" ("id") ON DELETE RESTRICT,
        ADD CONSTRAINT "FK_sale_items_rawMaterialCombinationId"
          FOREIGN KEY ("rawMaterialCombinationId") REFERENCES "raw_material_combinations" ("id") ON DELETE RESTRICT;
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_sale_items_rawMaterialId" ON "sale_items" ("rawMaterialId");`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_sale_items_rawMaterialCombinationId" ON "sale_items" ("rawMaterialCombinationId");`,
    );
    await queryRunner.query(`
      CREATE TABLE "productions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "isActive" boolean NOT NULL DEFAULT true,
        "createdBy" jsonb DEFAULT '{}'::jsonb,
        "updatedBy" jsonb DEFAULT '{}'::jsonb,
        "deletedBy" jsonb DEFAULT '{}'::jsonb,
        "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
        "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
        "deletedAt" timestamp without time zone,
        "isDeleted" boolean NOT NULL DEFAULT false,
        "productId" uuid NOT NULL,
        "quantity" double precision NOT NULL,
        "otherCost" double precision NOT NULL DEFAULT 0,
        "totalProductionCost" double precision NOT NULL DEFAULT 0,
        "productionCostPerUnit" double precision NOT NULL DEFAULT 0,
        "usedRawMaterials" jsonb NOT NULL DEFAULT '[]'::jsonb,
        "isNewProduct" boolean NOT NULL DEFAULT false,
        PRIMARY KEY ("id"),
        CONSTRAINT "FK_productions_productId"
          FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE RESTRICT
      );
    `);
    await queryRunner.query(`CREATE INDEX "IDX_productions_productId" ON "productions" ("productId");`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "productions";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_sale_items_rawMaterialId";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_sale_items_rawMaterialCombinationId";`);
    await queryRunner.query(`
      ALTER TABLE "sale_items"
        DROP CONSTRAINT IF EXISTS "FK_sale_items_rawMaterialId",
        DROP CONSTRAINT IF EXISTS "FK_sale_items_rawMaterialCombinationId",
        DROP COLUMN IF EXISTS "rawMaterialId",
        DROP COLUMN IF EXISTS "rawMaterialCombinationId",
        DROP COLUMN IF EXISTS "itemType";
    `);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_purchase_items_rawMaterialId";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_purchase_items_rawMaterialCombinationId";`);
    await queryRunner.query(`
      ALTER TABLE "purchase_items"
        DROP CONSTRAINT IF EXISTS "FK_purchase_items_rawMaterialId",
        DROP CONSTRAINT IF EXISTS "FK_purchase_items_rawMaterialCombinationId",
        DROP COLUMN IF EXISTS "rawMaterialId",
        DROP COLUMN IF EXISTS "rawMaterialCombinationId",
        DROP COLUMN IF EXISTS "itemType";
    `);
    await queryRunner.query(`DROP TABLE IF EXISTS "raw_material_combinations";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "raw_materials";`);
    await queryRunner.query(`ALTER TABLE "purchase_items" ALTER COLUMN "quantity" TYPE integer USING "quantity"::integer;`);
    await queryRunner.query(`ALTER TABLE "purchases" ALTER COLUMN "totalQuantity" TYPE integer USING "totalQuantity"::integer;`);
    await queryRunner.query(`ALTER TABLE "sale_items" ALTER COLUMN "quantity" TYPE integer USING "quantity"::integer;`);
    await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "stock" TYPE integer USING ROUND("stock")::integer;`);
  }
}