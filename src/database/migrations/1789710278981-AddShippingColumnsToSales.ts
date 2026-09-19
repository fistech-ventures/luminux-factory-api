import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddShippingColumnsToSales1789710278981 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "sales" 
            ADD COLUMN IF NOT EXISTS "shippingTo" varchar NOT NULL DEFAULT '',
            ADD COLUMN IF NOT EXISTS "shippingAddress" varchar
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "sales" 
            DROP COLUMN IF EXISTS "shippingTo",
            DROP COLUMN IF EXISTS "shippingAddress"
        `);
  }
}
