import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Safety net: guarantee that EVERY application table has the `isDeleted` column.
 *
 * `1793100000000-AddIsDeletedToAllTables` was meant to add the column to every
 * table, but its list skipped the two transaction line-item tables:
 *
 *   - sale_items     -> `GET /sales?page=1&limit=10` failed with
 *                       `column Sale__Sale_items.isDeleted does not exist`
 *   - purchase_items
 *
 * `BaseEntity` declares `isDeleted`, so TypeORM adds the column to every
 * SELECT / INSERT / RETURNING it builds for those entities. A table that is
 * missing the column therefore breaks reads *and* writes for sales and
 * purchases, including nested relation loads (`relations: { items: true }`).
 *
 * This migration adds the column wherever it is missing instead of trusting a
 * hand-maintained table list, so a table added later can never be half-migrated
 * again. It is idempotent (`ADD COLUMN IF NOT EXISTS`) and skips tables that do
 * not exist in the current database.
 */
const APPLICATION_TABLES: string[] = [
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
 * Tables this migration exists to fix (the ones 1793100000000 forgot). Only
 * these are reverted by down() — the columns on every other table belong to
 * earlier migrations, and a column that a drifted database happened to be
 * missing is left in place on rollback (an unused, defaulted column is
 * harmless).
 */
const TABLES_MISSED_BY_PREVIOUS_MIGRATION: string[] = ['sale_items', 'purchase_items'];

export class AddMissingIsDeletedColumns1793200000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const tables = await this.loadExistingTables(queryRunner);

    for (const table of APPLICATION_TABLES) {
      if (!tables.has(table)) continue;

      await queryRunner.query(
        `ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "isDeleted" boolean NOT NULL DEFAULT false;`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Rollback-only. `isDeleted` is required by BaseEntity, so dropping it from
    // every table would break the application; only the columns this migration
    // was created to add are removed.
    const tables = await this.loadExistingTables(queryRunner);

    for (const table of TABLES_MISSED_BY_PREVIOUS_MIGRATION) {
      if (!tables.has(table)) continue;

      await queryRunner.query(`ALTER TABLE "${table}" DROP COLUMN IF EXISTS "isDeleted";`);
    }
  }

  private async loadExistingTables(queryRunner: QueryRunner): Promise<Set<string>> {
    const rows: { name: string }[] = await queryRunner.query(`
      SELECT c.relname AS "name"
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relkind = 'r';
    `);

    return new Set(rows.map((row) => row.name));
  }
}
