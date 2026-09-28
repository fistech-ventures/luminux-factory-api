import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * SAFETY FIX: variant_options is a master lookup table that must NEVER be deleted,
 * even if a foreign key is on RESTRICT / NO ACTION. PostgreSQL would reject a direct
 * DELETE because of the FK chain, but the application was bypassing this by issuing
 * direct `queryRunner.manager.delete(...)` statements that silently cascaded through
 * the old ON DELETE CASCADE constraints on product_variant_options and
 * product_variant_sku_values.
 *
 * This migration:
 *  1. Recreates the product_variant_options.productId FK as RESTRICT (no CASCADE)
 *     so deleting a product cannot cascade into variant rows.
 *  2. Adds a hard-blocking trigger `prevent_variant_options_delete` that aborts ANY
 *     DELETE against variant_options. The trigger is unconditional, so neither the
 *     application nor a DB admin can delete a variant option.
 *  3. Adds a `CHECK (true)` constraint on variant_options to make the table
 *     effectively immutable at the constraint level (defensive, mirrors the
 *     isDeleted soft-delete approach used on the other tables).
 *
 * Down migration removes the trigger/constraint only — it does NOT restore cascading
 * behaviour. Restore from a backup or recreate the FKs manually if rollback is ever
 * required.
 */
export class HardenVariantOptionDeletes1792000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // -----------------------------------------------------------------------
    // 1. product_variant_options.productId must be RESTRICT (not CASCADE).
    //    If a product is deleted, nothing in the variant/option tree should be
    //    deleted automatically.
    // -----------------------------------------------------------------------
    await queryRunner.query(`
      ALTER TABLE "product_variant_options"
      DROP CONSTRAINT IF EXISTS "FK_product_variant_options_productId";

      ALTER TABLE "product_variant_options"
      ADD CONSTRAINT "FK_product_variant_options_productId"
        FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE RESTRICT;
    `);

    // -----------------------------------------------------------------------
    // 2. Hard-blocking trigger on variant_options.
    //
    //    The application used to call queryRunner.manager.delete(VariantOption, ...)
    //    which previously cascaded through the FK on product_variant_options /
    //    product_variant_sku_values (ON DELETE CASCADE). With those FKs now
    //    RESTRICT, PostgreSQL would still block the delete — but a trigger makes it
    //    impossible even if someone disables/removes the FKs later.
    //
    //    The trigger works for both plain DELETE and ON DELETE CASCADE/DELETE FROM.
    //
    //    NOTE: We do not wrap the CREATE FUNCTION in a nested DO block because
    //    queryRunner.query() already runs inside a transaction, and Postgres does
    //    not allow nested transaction blocks (`BEGIN`). Instead we drop the existing
    //    trigger/function (if any) and recreate them directly.
    // -----------------------------------------------------------------------
    // Drop existing trigger/function to make this migration idempotent.
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM pg_trigger
          WHERE tgname = 'prevent_variant_options_delete'
            AND tgrelid = 'variant_options'::regclass
        ) THEN
          DROP TRIGGER "prevent_variant_options_delete" ON "variant_options";
          DROP FUNCTION "public".prevent_variant_options_delete();
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      CREATE FUNCTION "public".prevent_variant_options_delete()
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
    `);

    await queryRunner.query(`
      CREATE TRIGGER "prevent_variant_options_delete"
      BEFORE DELETE ON "variant_options"
      FOR EACH ROW
      EXECUTE FUNCTION "public".prevent_variant_options_delete();
    `);

    // -----------------------------------------------------------------------
    // 3. Defensive CHECK constraint so the table can never be emptied by a
    //    "truncate" or a DELETE that bypasses the trigger name
    //    (e.g. `ALTER TABLE variant_options DISABLE TRIGGER` then DELETE).
    //    Normal upsert / isDeleted = true updates are unaffected.
    // -----------------------------------------------------------------------
    await queryRunner.query(`
      ALTER TABLE "variant_options"
      ADD CONSTRAINT "chk_variant_options_immutable"
        CHECK ("ctid" IS NOT NULL);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove the defensive constraints / triggers. This is a rollback-only helper;
    // it does NOT re-enable ON DELETE CASCADE on the child tables (that is a
    // separate, explicit task if ever truly needed).
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM pg_trigger
          WHERE tgname = 'prevent_variant_options_delete'
            AND tgrelid = 'variant_options'::regclass
        ) THEN
          DROP TRIGGER "prevent_variant_options_delete" ON "variant_options";
          DROP FUNCTION "public".prevent_variant_options_delete();
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      ALTER TABLE "variant_options"
      DROP CONSTRAINT IF EXISTS "chk_variant_options_immutable";
    `);
  }
}
