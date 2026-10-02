import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNameAndUnitToProductVariantSkus1790208001000 implements MigrationInterface {
  name = 'AddNameAndUnitToProductVariantSkus1790208001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('product_variant_skus'))) return;

    await queryRunner.query(
      'ALTER TABLE "product_variant_skus" ADD COLUMN IF NOT EXISTS "name" varchar(255)',
    );
    await queryRunner.query(
      'ALTER TABLE "product_variant_skus" ADD COLUMN IF NOT EXISTS "unit" varchar(50)',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('product_variant_skus'))) return;

    await queryRunner.query(
      'ALTER TABLE "product_variant_skus" DROP COLUMN IF EXISTS "unit"',
    );
    await queryRunner.query(
      'ALTER TABLE "product_variant_skus" DROP COLUMN IF EXISTS "name"',
    );
  }
}