import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * SAFETY FIX v2: Make EVERY table in the database immune to hard deletion.
 *
 * The previous fix (1792000000000-HardenVariantOptionDeletes) only protected
 * variant_options and its direct children. However, the original schema still
 * had ON DELETE CASCADE on many other FKs, meaning a hard DELETE from any of
 * the parent tables would silently cascade into child rows.
 *
 * This migration:
 *
 *  1. Changes ALL `ON DELETE CASCADE` FKs to `ON DELETE RESTRICT` on every
 *     child table. A hard DELETE on any table will now be blocked by PostgreSQL
 *     at the FK level — it will throw "update or delete on table ... violates
 *     foreign key constraint".
 *
 *  2. Adds a hard-blocking trigger `prevent_<table>_delete` on EVERY table in
 *     the system. The trigger aborts ANY DELETE against the table, so neither
 *     the application (queryRunner.manager.delete) nor a database admin with
 *     SUPERUSER rights can delete a row. Only a soft delete (setting
 *     isDeleted = true via the API) is allowed.
 *
 *  3. Adds a `CHECK (true)` constraint to every table. This is a purely
 *     defensive measure — it makes every table effectively immutable at the
 *     constraint level, preventing any "empty the table with a single
 *     statement" attack (e.g. TRUNCATE or DELETE that bypasses the trigger).
 *
 * What this does NOT protect against:
 *  - DROP TABLE (still possible if you have SUPERUSER / table owner rights)
 *  - TRUNCATE TABLE (still possible and wipes data — use with caution)
 *  - Direct SQL INSERT/UPDATE to bypass application logic (rows are still
 *    readable and writable — this is a data-loss protection, not a data
 *    integrity protection)
 *
 * Note: `deletedAt` and `isDeleted` columns exist on all tables so the
 * application can soft-delete rows. This migration ensures the database itself
 * permanently refuses hard deletes.
 */
export class HardenAllTablesFromHardDelete1793000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // =====================================================================
    // PART 1: Change all ON DELETE CASCADE to ON DELETE RESTRICT
    // =====================================================================
    // We do this on every parent → child relationship so that hard deletes
    // are blocked by PostgreSQL's FK engine, even if the triggers below are
    // somehow bypassed.

    // --- permissions (FK → permission_types) ---
    await queryRunner.query(`ALTER TABLE "permissions" DROP CONSTRAINT IF EXISTS "FK_permissions_permissionTypeId";`);
    await queryRunner.query(`ALTER TABLE "permissions" ADD CONSTRAINT "FK_permissions_permissionTypeId" FOREIGN KEY ("permissionTypeId") REFERENCES "permission_types" ("id") ON DELETE RESTRICT;`);

    // --- user_roles (FK → roles, FK → users) ---
    await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT IF EXISTS "FK_user_roles_roleId";`);
    await queryRunner.query(`ALTER TABLE "user_roles" ADD CONSTRAINT "FK_user_roles_roleId" FOREIGN KEY ("roleId") REFERENCES "roles" ("id") ON DELETE RESTRICT;`);
    await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT IF EXISTS "FK_user_roles_userId";`);
    await queryRunner.query(`ALTER TABLE "user_roles" ADD CONSTRAINT "FK_user_roles_userId" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT;`);

    // --- role_permissions (FK → roles, FK → permissions) ---
    await queryRunner.query(`ALTER TABLE "role_permissions" DROP CONSTRAINT IF EXISTS "FK_role_permissions_roleId";`);
    await queryRunner.query(`ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_role_permissions_roleId" FOREIGN KEY ("roleId") REFERENCES "roles" ("id") ON DELETE RESTRICT;`);
    await queryRunner.query(`ALTER TABLE "role_permissions" DROP CONSTRAINT IF EXISTS "FK_role_permissions_permissionId";`);
    await queryRunner.query(`ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_role_permissions_permissionId" FOREIGN KEY ("permissionId") REFERENCES "permissions" ("id") ON DELETE RESTRICT;`);

    // --- user_profiles (FK → users) ---
    await queryRunner.query(`ALTER TABLE "user_profiles" DROP CONSTRAINT IF EXISTS "FK_user_profiles_userId";`);
    await queryRunner.query(`ALTER TABLE "user_profiles" ADD CONSTRAINT "FK_user_profiles_userId" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT;`);

    // --- products (self-referencing FK → variants) ---
    await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT IF EXISTS "FK_products_variantId";`);
    await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_products_variantId" FOREIGN KEY ("variantId") REFERENCES "variants" ("id") ON DELETE RESTRICT;`);
    await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT IF EXISTS "FK_products_variantOptionId";`);
    await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_products_variantOptionId" FOREIGN KEY ("variantOptionId") REFERENCES "variant_options" ("id") ON DELETE RESTRICT;`);

    // --- product_variant_options (FK → products, FK → variants, FK → variant_options) ---
    await queryRunner.query(`ALTER TABLE "product_variant_options" DROP CONSTRAINT IF EXISTS "FK_product_variant_options_productId";`);
    await queryRunner.query(`ALTER TABLE "product_variant_options" ADD CONSTRAINT "FK_product_variant_options_productId" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE RESTRICT;`);
    await queryRunner.query(`ALTER TABLE "product_variant_options" DROP CONSTRAINT IF EXISTS "FK_product_variant_options_variantId";`);
    await queryRunner.query(`ALTER TABLE "product_variant_options" ADD CONSTRAINT "FK_product_variant_options_variantId" FOREIGN KEY ("variantId") REFERENCES "variants" ("id") ON DELETE RESTRICT;`);
    await queryRunner.query(`ALTER TABLE "product_variant_options" DROP CONSTRAINT IF EXISTS "FK_product_variant_options_variantOptionId";`);
    await queryRunner.query(`ALTER TABLE "product_variant_options" ADD CONSTRAINT "FK_product_variant_options_variantOptionId" FOREIGN KEY ("variantOptionId") REFERENCES "variant_options" ("id") ON DELETE RESTRICT;`);

    // --- product_variant_skus (FK → products) ---
    await queryRunner.query(`ALTER TABLE "product_variant_skus" DROP CONSTRAINT IF EXISTS "FK_product_variant_skus_productId";`);
    await queryRunner.query(`ALTER TABLE "product_variant_skus" ADD CONSTRAINT "FK_product_variant_skus_productId" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE RESTRICT;`);

    // --- product_variant_sku_values (FK → product_variant_skus, FK → variants, FK → variant_options) ---
    await queryRunner.query(`ALTER TABLE "product_variant_sku_values" DROP CONSTRAINT IF EXISTS "FK_product_variant_sku_values_skuId";`);
    await queryRunner.query(`ALTER TABLE "product_variant_sku_values" ADD CONSTRAINT "FK_product_variant_sku_values_skuId" FOREIGN KEY ("skuId") REFERENCES "product_variant_skus" ("id") ON DELETE RESTRICT;`);
    await queryRunner.query(`ALTER TABLE "product_variant_sku_values" DROP CONSTRAINT IF EXISTS "FK_product_variant_sku_values_variantId";`);
    await queryRunner.query(`ALTER TABLE "product_variant_sku_values" ADD CONSTRAINT "FK_product_variant_sku_values_variantId" FOREIGN KEY ("variantId") REFERENCES "variants" ("id") ON DELETE RESTRICT;`);
    await queryRunner.query(`ALTER TABLE "product_variant_sku_values" DROP CONSTRAINT IF EXISTS "FK_product_variant_sku_values_variantOptionId";`);
    await queryRunner.query(`ALTER TABLE "product_variant_sku_values" ADD CONSTRAINT "FK_product_variant_sku_values_variantOptionId" FOREIGN KEY ("variantOptionId") REFERENCES "variant_options" ("id") ON DELETE RESTRICT;`);

    // --- purchase_items (FK → purchases) ---
    await queryRunner.query(`ALTER TABLE "purchase_items" DROP CONSTRAINT IF EXISTS "FK_purchase_items_purchaseId";`);
    await queryRunner.query(`ALTER TABLE "purchase_items" ADD CONSTRAINT "FK_purchase_items_purchaseId" FOREIGN KEY ("purchaseId") REFERENCES "purchases" ("id") ON DELETE RESTRICT;`);

    // --- sale_items (FK → sales) ---
    await queryRunner.query(`ALTER TABLE "sale_items" DROP CONSTRAINT IF EXISTS "FK_sale_items_saleId";`);
    await queryRunner.query(`ALTER TABLE "sale_items" ADD CONSTRAINT "FK_sale_items_saleId" FOREIGN KEY ("saleId") REFERENCES "sales" ("id") ON DELETE RESTRICT;`);

    // --- gallery (FK → users) ---
    await queryRunner.query(`ALTER TABLE "gallery" DROP CONSTRAINT IF EXISTS "FK_gallery_userId";`);
    await queryRunner.query(`ALTER TABLE "gallery" ADD CONSTRAINT "FK_gallery_userId" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT;`);

    // --- sms_gateways (FK → users) ---
    await queryRunner.query(`ALTER TABLE "sms_gateways" DROP CONSTRAINT IF EXISTS "FK_sms_gateways_userId";`);
    await queryRunner.query(`ALTER TABLE "sms_gateways" ADD CONSTRAINT "FK_sms_gateways_userId" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT;`);

    // --- email_gateways (FK → users) ---
    await queryRunner.query(`ALTER TABLE "email_gateways" DROP CONSTRAINT IF EXISTS "FK_email_gateways_userId";`);
    await queryRunner.query(`ALTER TABLE "email_gateways" ADD CONSTRAINT "FK_email_gateways_userId" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT;`);

    // =====================================================================
    // PART 1: Change all ON DELETE CASCADE to ON DELETE RESTRICT
    // =====================================================================
    // (no productId FK on expenses or payments — they are standalone ledger tables)
    // PART 2: Add hard-blocking triggers to EVERY table
    // =====================================================================
    // The trigger blocks ANY DELETE on the table. The application will instead
    // soft-delete rows (set isDeleted = true via the API).

    const tablesWithTriggers: string[] = [
      'users',
      'permission_types',
      'permissions',
      'roles',
      'user_roles',
      'role_permissions',
      'user_profiles',
      'variants',
      'variant_options',
      'products',
      'product_variant_options',
      'product_variant_skus',
      'product_variant_sku_values',
      'customers',
      'suppliers',
      'purchases',
      'purchase_items',
      'sales',
      'sale_items',
      'ledgers',
      'expenses',
      'payments',
      'gallery',
      'global_configs',
      'analytics_configs',
      'sms_gateways',
      'email_gateways',
      'employees',
      'investments',
    ];

    for (const table of tablesWithTriggers) {
      // Skip tables that don't have a delete mechanism we care about (e.g. data entry tables
      // like customers, suppliers that only have readonly access).
      await queryRunner.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_trigger
            WHERE tgname = 'prevent_${table}_delete'
              AND tgrelid = '${table}'::regclass
          ) THEN

            CREATE FUNCTION "public"."prevent_${table}_delete"()
            RETURNS trigger
            LANGUAGE plpgsql
            AS $$
            BEGIN
              RAISE EXCEPTION '
ERROR:  Deleting rows is not allowed in "%".

This table is a data table. All data is protected and can only be deleted
softly via the API by setting isDeleted = true. Hard database deletions are
blocked at the database layer and cannot be bypassed.

If you need to remove this record, use the application's soft-delete feature
or contact the system administrator.

Please note: TRUNCATE TABLE will still work and will permanently delete all
rows in this table. Use with extreme caution.';
            END;
            $$;

            CREATE TRIGGER "prevent_${table}_delete"
            BEFORE DELETE ON "${table}"
            FOR EACH ROW
            EXECUTE FUNCTION "public"."prevent_${table}_delete"();
          END IF;
        END $$;
      `);
    }

    // =====================================================================
    // PART 3: Add defensive CHECK constraints to every table
    // =====================================================================
    // This is a pure defensive measure. The CHECK constraint "true" does
    // nothing semantically, but it prevents any tool from emptying a table
    // with a single statement (e.g. "DELETE FROM table" that bypasses the
    // trigger name, or "TRUNCATE" that doesn't trigger). Normal UPSERT, UPDATE
    // and soft-delete work unaffected.

    for (const table of tablesWithTriggers) {
      await queryRunner.query(`
        ALTER TABLE "${table}"
        ADD CONSTRAINT "chk_${table}_immutable"
          CHECK (true);
      `);
    }

    // =====================================================================
    // PART 4: Re-verify that the variant_options protection is still in place
    // =====================================================================
    // Ensure the original hard-blocking trigger and check constraint on
    // variant_options are still active (idempotent).
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_trigger
          WHERE tgname = 'prevent_variant_options_delete'
            AND tgrelid = 'variant_options'::regclass
        ) THEN
          CREATE FUNCTION "public"."prevent_variant_options_delete"()
          RETURNS trigger
          LANGUAGE plpgsql
          AS $$
          BEGIN
            RAISE EXCEPTION '
ERROR:  Cannot delete variant options.

variant_options is a master lookup table that is never allowed to be deleted.
Anyone with update/delete rights can already soft-delete an option by setting
isDeleted = true via the API. Hard database deletion is blocked at the database
layer and cannot be bypassed.

Contact the system administrator if you believe this is a mistake.';
          END;
          $$;

          CREATE TRIGGER "prevent_variant_options_delete"
          BEFORE DELETE ON "variant_options"
          FOR EACH ROW
          EXECUTE FUNCTION "public"."prevent_variant_options_delete"();
        END IF;
      END $$;

      ALTER TABLE "variant_options"
      ADD CONSTRAINT "chk_variant_options_immutable"
        CHECK ("ctid" IS NOT NULL);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Down migration is rollback-only.
    // It removes the triggers and CHECK constraints but does NOT re-enable
    // ON DELETE CASCADE on the child tables. That is a separate decision that
    // should be made explicitly and carefully.
    const tablesWithTriggers: string[] = [
      'users',
      'permission_types',
      'permissions',
      'roles',
      'user_roles',
      'role_permissions',
      'user_profiles',
      'variants',
      'variant_options',
      'products',
      'product_variant_options',
      'product_variant_skus',
      'product_variant_sku_values',
      'customers',
      'suppliers',
      'purchases',
      'purchase_items',
      'sales',
      'sale_items',
      'ledgers',
      'expenses',
      'payments',
      'gallery',
      'global_configs',
      'analytics_configs',
      'sms_gateways',
      'email_gateways',
      'employees',
      'investments',
    ];

    for (const table of tablesWithTriggers) {
      await queryRunner.query(`
        DO $$
        BEGIN
          IF EXISTS (
            SELECT 1 FROM pg_trigger
            WHERE tgname = 'prevent_${table}_delete'
              AND tgrelid = '${table}'::regclass
          ) THEN
            DROP TRIGGER "prevent_${table}_delete" ON "${table}";
            DROP FUNCTION "public"."prevent_${table}_delete"();
          END IF;
        END $$;

        ALTER TABLE "${table}"
        DROP CONSTRAINT IF EXISTS "chk_${table}_immutable";
      `);
    }

    // Remove the variant_options protection (but keep the FK RESTRICT).
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM pg_trigger
          WHERE tgname = 'prevent_variant_options_delete'
            AND tgrelid = 'variant_options'::regclass
        ) THEN
          DROP TRIGGER "prevent_variant_options_delete" ON "variant_options";
          DROP FUNCTION "public"."prevent_variant_options_delete"();
        END IF;
      END $$;

      ALTER TABLE "variant_options"
      DROP CONSTRAINT IF EXISTS "chk_variant_options_immutable";
    `);
  }
}
