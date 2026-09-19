import { MigrationInterface, QueryRunner } from "typeorm";

export class RefactorShippingAddress1789843068883 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add shippingContact column if it doesn't exist
        await queryRunner.query(`
            ALTER TABLE "sales" 
            ADD COLUMN IF NOT EXISTS "shippingContact" varchar(255)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert: Remove shippingContact column
        await queryRunner.query(`
            ALTER TABLE "sales" 
            DROP COLUMN IF EXISTS "shippingContact"
        `);
    }

}
