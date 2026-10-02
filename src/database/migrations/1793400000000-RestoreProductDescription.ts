import { MigrationInterface, QueryRunner } from 'typeorm';

export class RestoreProductDescription1793400000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "description" text;`,
    );
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // Keep descriptions entered after migration; dropping this column would lose user data.
  }
}