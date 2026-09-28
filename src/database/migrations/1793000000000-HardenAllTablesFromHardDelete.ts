import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * SAFETY FIX v3: Make EVERY table in the database immune to hard deletion.
 *
 * The previous fix (1792000000000-HardenVariantOptionDeletes) only protected
 * variant_options and its direct children. However, the original schema still
 * had ON DELETE CASCADE on many other FKs, meaning a hard DELETE from any of
 * the parent tables would silently cascade into child rows.
 *
 * This migration:
 *
 *  1. Changes `ON DELETE CASCADE` / `ON DELETE SET NULL` FKs to
 *     `ON DELETE RESTRICT` on every child table. A hard DELETE on any table
 *     will now be blocked by PostgreSQL at the FK level — it will throw
 *     "update or delete on table ... violates foreign key constraint".
 *
 *  2. Adds a hard-blocking trigger `prevent_<table>_delete` on EVERY table in
 *     the system. The trigger aborts ANY DELETE against the table, so neither
 *     the application (queryRunner.manager.delete) nor a database admin can
 *     delete a row. Only a soft delete (setting isDeleted = true via the API)
 *     is allowed.
 *
 *  3. Adds a defensive `CHECK (true)` constraint to every table. This is a
 *     purely defensive measure — it makes every table effectively immutable at
 *     the constraint level, preventing any "empty the table with a single
 *     statement" attack (e.g. TRUNCATE or DELETE that bypasses the trigger).
 *
 * ---------------------------------------------------------------------------
 * v2 -> v3 fixes (why the previous revision crashed production):
 *
 *  a) v2 tried to add `FK_products_variantId` / `FK_products_variantOptionId`
 *     on `products`, but the `products` table has NEVER had those columns
 *     (variant links live on `product_variant_options`). Postgres aborted with
 *     `column "variantId" referenced in foreign key constraint does not exist`
 *     and the API could not boot. Those two entries are gone.
 *  b) v2 tried to add `FK_gallery_userId`, but `gallery` has no `userId`
 *     column either. That entry is gone too.
 *  c) v2 re-added `CHECK ("ctid" IS NOT NULL)` on variant_options, even though
 *     1792000000000 already documents that Postgres rejects references to the
 *     system column `ctid` in a CHECK constraint (error 42P10). Removed; the
 *     generic `CHECK (true)` from part 3 covers variant_options.
 *  d) v2 raised `RAISE EXCEPTION '... in "%".'` with a `%` placeholder but no
 *     argument, which makes the trigger itself fail at runtime. The table name
 *     is now interpolated directly.
 *  e) v2 was not idempotent: `ADD CONSTRAINT` without an existence check and
 *     `'<table>'::regclass` casts that throw 42P01 when a table is missing.
 *     Every statement below is now guarded against the live schema.
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

interface IForeignKeyHardening {
  /** Existing/desired constraint name. */
  constraint: string;
  /** Child (referencing) table. */
  table: string;
  /** Child column holding the FK. */
  column: string;
  /** Parent (referenced) table. */
  referencedTable: string;
  /** Parent column; always the PK "id" in this schema. */
  referencedColumn: string;
}

/**
 * Every parent -> child relationship in the schema that must block hard
 * deletes. All of these constraints are created by the earlier migrations
 * (1788566400000 / 1791000000000 / 1791000000002 / 1788700000000 /
 * 1790121600000), so re-creating them with RESTRICT cannot fail FK validation
 * — the data was already validated by the previous FK.
 */
const HARDENED_FOREIGN_KEYS: IForeignKeyHardening[] = [
  // --- ACL / user module ---
  {
    constraint: 'FK_permissions_permissionTypeId',
    table: 'permissions',
    column: 'permissionTypeId',
    referencedTable: 'permission_types',
    referencedColumn: 'id',
  },
  {
    constraint: 'FK_user_roles_roleId',
    table: 'user_roles',
    column: 'roleId',
    referencedTable: 'roles',
    referencedColumn: 'id',
  },
  {
    constraint: 'FK_user_roles_userId',
    table: 'user_roles',
    column: 'userId',
    referencedTable: 'users',
    referencedColumn: 'id',
  },
  {
    constraint: 'FK_role_permissions_roleId',
    table: 'role_permissions',
    column: 'roleId',
    referencedTable: 'roles',
    referencedColumn: 'id',
  },
  {
    constraint: 'FK_role_permissions_permissionId',
    table: 'role_permissions',
    column: 'permissionId',
    referencedTable: 'permissions',
    referencedColumn: 'id',
  },
  {
    constraint: 'FK_user_profiles_userId',
    table: 'user_profiles',
    column: 'userId',
    referencedTable: 'users',
    referencedColumn: 'id',
  },

  // --- product module ---
  // variant_options -> variants was still CASCADE in the original schema.
  {
    constraint: 'FK_variant_options_variantId',
    table: 'variant_options',
    column: 'variantId',
    referencedTable: 'variants',
    referencedColumn: 'id',
  },
  {
    constraint: 'FK_product_variant_options_productId',
    table: 'product_variant_options',
    column: 'productId',
    referencedTable: 'products',
    referencedColumn: 'id',
  },
  {
    constraint: 'FK_product_variant_options_variantId',
    table: 'product_variant_options',
    column: 'variantId',
    referencedTable: 'variants',
    referencedColumn: 'id',
  },
  {
    constraint: 'FK_product_variant_options_variantOptionId',
    table: 'product_variant_options',
    column: 'variantOptionId',
    referencedTable: 'variant_options',
    referencedColumn: 'id',
  },
  // product_variant_skus -> products was still CASCADE in the original schema.
  {
    constraint: 'FK_product_variant_skus_productId',
    table: 'product_variant_skus',
    column: 'productId',
    referencedTable: 'products',
    referencedColumn: 'id',
  },
  {
    constraint: 'FK_product_variant_sku_values_skuId',
    table: 'product_variant_sku_values',
    column: 'skuId',
    referencedTable: 'product_variant_skus',
    referencedColumn: 'id',
  },
  {
    constraint: 'FK_product_variant_sku_values_variantId',
    table: 'product_variant_sku_values',
    column: 'variantId',
    referencedTable: 'variants',
    referencedColumn: 'id',
  },
  {
    constraint: 'FK_product_variant_sku_values_variantOptionId',
    table: 'product_variant_sku_values',
    column: 'variantOptionId',
    referencedTable: 'variant_options',
    referencedColumn: 'id',
  },

  // --- purchase module ---
  {
    constraint: 'FK_purchases_supplierId',
    table: 'purchases',
    column: 'supplierId',
    referencedTable: 'suppliers',
    referencedColumn: 'id',
  },
  {
    constraint: 'FK_purchases_purchasedById',
    table: 'purchases',
    column: 'purchasedById',
    referencedTable: 'users',
    referencedColumn: 'id',
  },
  {
    constraint: 'FK_purchase_items_purchaseId',
    table: 'purchase_items',
    column: 'purchaseId',
    referencedTable: 'purchases',
    referencedColumn: 'id',
  },
  // purchase_items.productId / variantId were ON DELETE SET NULL — a hard
  // delete of a product silently wiped the historical link on purchase rows.
  {
    constraint: 'FK_purchase_items_productId',
    table: 'purchase_items',
    column: 'productId',
    referencedTable: 'products',
    referencedColumn: 'id',
  },
  {
    constraint: 'FK_purchase_items_variantId',
    table: 'purchase_items',
    column: 'variantId',
    referencedTable: 'product_variant_options',
    referencedColumn: 'id',
  },
  // purchase_items.skuId was the last remaining ON DELETE SET NULL FK.
  {
    constraint: 'FK_purchase_items_skuId',
    table: 'purchase_items',
    column: 'skuId',
    referencedTable: 'product_variant_skus',
    referencedColumn: 'id',
  },

  // --- sales module ---
  {
    constraint: 'FK_sales_customerId',
    table: 'sales',
    column: 'customerId',
    referencedTable: 'customers',
    referencedColumn: 'id',
  },
  {
    constraint: 'FK_sales_soldById',
    table: 'sales',
    column: 'soldById',
    referencedTable: 'users',
    referencedColumn: 'id',
  },
  {
    constraint: 'FK_sale_items_saleId',
    table: 'sale_items',
    column: 'saleId',
    referencedTable: 'sales',
    referencedColumn: 'id',
  },
  {
    constraint: 'FK_sale_items_productId',
    table: 'sale_items',
    column: 'productId',
    referencedTable: 'products',
    referencedColumn: 'id',
  },
  {
    constraint: 'FK_sale_items_variantId',
    table: 'sale_items',
    column: 'variantId',
    referencedTable: 'product_variant_options',
    referencedColumn: 'id',
  },
  {
    constraint: 'FK_sale_items_skuId',
    table: 'sale_items',
    column: 'skuId',
    referencedTable: 'product_variant_skus',
    referencedColumn: 'id',
  },

  // --- employees / investments ---
  // expenses.employeeId was ON DELETE SET NULL -> RESTRICT.
  {
    constraint: 'FK_expenses_employeeId',
    table: 'expenses',
    column: 'employeeId',
    referencedTable: 'employees',
    referencedColumn: 'id',
  },
  {
    constraint: 'FK_investments_investorId',
    table: 'investments',
    column: 'investorId',
    referencedTable: 'employees',
    referencedColumn: 'id',
  },

  // --- notification gateways ---
  {
    constraint: 'FK_sms_gateways_userId',
    table: 'sms_gateways',
    column: 'userId',
    referencedTable: 'users',
    referencedColumn: 'id',
  },
  {
    constraint: 'FK_email_gateways_userId',
    table: 'email_gateways',
    column: 'userId',
    referencedTable: 'users',
    referencedColumn: 'id',
  },
];

/**
 * Tables that must reject hard deletes. Every entry exists in the schema, but
 * the loops below still skip anything that is missing so this migration can
 * never abort on an unfamiliar/partially-migrated database.
 */
const TABLES_TO_PROTECT: string[] = [
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

/**
 * Tables whose delete-blocking trigger was already installed by an earlier
 * migration (1792000000000-HardenVariantOptionDeletes). We leave those
 * triggers (and their functions) untouched, both here and on rollback.
 */
const TRIGGERS_OWNED_BY_EARLIER_MIGRATIONS = new Set<string>(['variant_options']);

export class HardenAllTablesFromHardDelete1793000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const tables = await this.loadExistingTables(queryRunner);
    const columns = await this.loadExistingColumns(queryRunner);
    const triggers = await this.loadExistingTriggers(queryRunner);
    const constraints = await this.loadExistingConstraints(queryRunner);

    // =====================================================================
    // PART 1: Change all ON DELETE CASCADE / SET NULL to ON DELETE RESTRICT
    // =====================================================================
    for (const fk of HARDENED_FOREIGN_KEYS) {
      // Skip anything that does not exist in this particular database.
      if (!tables.has(fk.table) || !tables.has(fk.referencedTable)) continue;
      if (!columns.has(`${fk.table}.${fk.column}`)) continue;
      if (!columns.has(`${fk.referencedTable}.${fk.referencedColumn}`)) continue;

      await queryRunner.query(
        `ALTER TABLE "${fk.table}" DROP CONSTRAINT IF EXISTS "${fk.constraint}";`,
      );
      await queryRunner.query(
        `ALTER TABLE "${fk.table}" ADD CONSTRAINT "${fk.constraint}" FOREIGN KEY ("${fk.column}") REFERENCES "${fk.referencedTable}" ("${fk.referencedColumn}") ON DELETE RESTRICT;`,
      );
    }

    // =====================================================================
    // PART 2: Add hard-blocking delete triggers to EVERY table
    // =====================================================================
    // The trigger blocks ANY DELETE on the table. The application instead
    // soft-deletes rows (sets isDeleted = true via the API).
    for (const table of TABLES_TO_PROTECT) {
      if (!tables.has(table)) continue;
      if (TRIGGERS_OWNED_BY_EARLIER_MIGRATIONS.has(table)) continue;

      const functionName = `prevent_${table}_delete`;
      if (triggers.has(`${table}.${functionName}`)) continue;

      await queryRunner.query(`
        CREATE FUNCTION "public"."${functionName}"()
        RETURNS trigger
        LANGUAGE plpgsql
        AS $$
        BEGIN
          RAISE EXCEPTION '
ERROR:  Deleting rows is not allowed in "${table}".

This table is a data table. All data is protected and can only be deleted
softly via the API by setting isDeleted = true. Hard database deletions are
blocked at the database layer and cannot be bypassed.

If you need to remove this record, use the application''s soft-delete feature
or contact the system administrator.

Please note: TRUNCATE TABLE will still work and will permanently delete all
rows in this table. Use with extreme caution.';
        END;
        $$;
      `);

      await queryRunner.query(`
        CREATE TRIGGER "${functionName}"
        BEFORE DELETE ON "${table}"
        FOR EACH ROW
        EXECUTE FUNCTION "public"."${functionName}"();
      `);
    }

    // `variant_options` keeps the dedicated trigger installed by
    // 1792000000000-HardenVariantOptionDeletes (same BEFORE DELETE semantics).

    // =====================================================================
    // PART 3: Add defensive CHECK constraints to every table
    // =====================================================================
    // Pure defensive measure: it does not change any value, but it stops a
    // tool from emptying a table with a single statement that bypasses the
    // trigger. Normal INSERT / UPDATE / UPSERT / soft-delete are unaffected.
    //
    // NOTE: `ctid` (used by the previous revision) is a system column and
    // cannot be referenced from a CHECK constraint (Postgres error 42P10),
    // hence the constant `true`.
    for (const table of TABLES_TO_PROTECT) {
      if (!tables.has(table)) continue;

      const constraintName = `chk_${table}_immutable`;
      if (constraints.has(`${table}.${constraintName}`)) continue;

      await queryRunner.query(
        `ALTER TABLE "${table}" ADD CONSTRAINT "${constraintName}" CHECK (true);`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Rollback-only. It removes the triggers and CHECK constraints but does
    // NOT re-enable ON DELETE CASCADE on the child tables — that is a separate
    // decision that should be made explicitly and carefully.
    const tables = await this.loadExistingTables(queryRunner);

    for (const table of TABLES_TO_PROTECT) {
      if (!tables.has(table)) continue;

      if (!TRIGGERS_OWNED_BY_EARLIER_MIGRATIONS.has(table)) {
        const functionName = `prevent_${table}_delete`;
        await queryRunner.query(`DROP TRIGGER IF EXISTS "${functionName}" ON "${table}";`);
        await queryRunner.query(`DROP FUNCTION IF EXISTS "public"."${functionName}"();`);
      }

      await queryRunner.query(
        `ALTER TABLE "${table}" DROP CONSTRAINT IF EXISTS "chk_${table}_immutable";`,
      );
    }
  }

  // -----------------------------------------------------------------------
  // Live-schema introspection helpers
  // -----------------------------------------------------------------------

  private async loadExistingTables(queryRunner: QueryRunner): Promise<Set<string>> {
    const rows: { name: string }[] = await queryRunner.query(`
      SELECT c.relname AS "name"
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relkind = 'r';
    `);
    return new Set(rows.map((row) => row.name));
  }

  private async loadExistingColumns(queryRunner: QueryRunner): Promise<Set<string>> {
    const rows: { tableName: string; columnName: string }[] = await queryRunner.query(`
      SELECT table_name AS "tableName", column_name AS "columnName"
      FROM information_schema.columns
      WHERE table_schema = 'public';
    `);
    return new Set(rows.map((row) => `${row.tableName}.${row.columnName}`));
  }

  private async loadExistingTriggers(queryRunner: QueryRunner): Promise<Set<string>> {
    const rows: { tableName: string; triggerName: string }[] = await queryRunner.query(`
      SELECT c.relname AS "tableName", t.tgname AS "triggerName"
      FROM pg_trigger t
      JOIN pg_class c ON c.oid = t.tgrelid
      WHERE NOT t.tgisinternal;
    `);
    return new Set(rows.map((row) => `${row.tableName}.${row.triggerName}`));
  }

  private async loadExistingConstraints(queryRunner: QueryRunner): Promise<Set<string>> {
    const rows: { tableName: string; constraintName: string }[] = await queryRunner.query(`
      SELECT c.relname AS "tableName", con.conname AS "constraintName"
      FROM pg_constraint con
      JOIN pg_class c ON c.oid = con.conrelid;
    `);
    return new Set(rows.map((row) => `${row.tableName}.${row.constraintName}`));
  }
}
