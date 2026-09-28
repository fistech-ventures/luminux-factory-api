import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds `isDeleted` column to ALL tables in the application.
 *
 * The `isDeleted` column is a boolean with a default of `false`.
 * Setting `isDeleted = true` marks the row as "soft-deleted".
 * Soft-deleted rows are ignored by all read API calls.
 * No DELETE statement is executed at the database level.
 *
 * This migration adds the column to all tables that don't have it yet,
 * so that the application can gradually migrate to soft-delete semantics
 * without needing to be strict about which tables must have the column.
 *
 * The migration is idempotent — it uses IF NOT EXISTS, so running it
 * multiple times is safe.
 */
export class AddIsDeletedToAllTables1793100000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // List all tables that need isDeleted column.
    // Tables that already have isDeleted (from SoftDeleteAndFKFixes):
    //   - variant_options
    //   - product_variant_options
    //   - product_variant_skus
    //   - product_variant_sku_values
    // These are NOT included here — they already have the column.

    const tables = [
      'users',
      'permission_types',
      'permissions',
      'roles',
      'user_roles',
      'role_permissions',
      'user_profiles',
      'variants',
      'products',
      'product_variant_skus',
      'customers',
      'suppliers',
      'purchases',
      'sales',
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

    for (const table of tables) {
      await queryRunner.query(`
        ALTER TABLE "${table}"
        ADD COLUMN IF NOT EXISTS "isDeleted" boolean NOT NULL DEFAULT false;
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Rollback: remove isDeleted columns. This is rollback-only and should
    // never be needed in production.
    const tables = [
      'users',
      'permission_types',
      'permissions',
      'roles',
      'user_roles',
      'role_permissions',
      'user_profiles',
      'variants',
      'products',
      'product_variant_skus',
      'customers',
      'suppliers',
      'purchases',
      'sales',
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

    for (const table of tables) {
      await queryRunner.query(`
        ALTER TABLE "${table}"
        DROP COLUMN IF EXISTS "isDeleted";
      `);
    }
  }
}
