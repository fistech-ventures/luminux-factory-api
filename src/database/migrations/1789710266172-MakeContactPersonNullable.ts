import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeContactPersonNullable1789710266172 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "suppliers" 
            ALTER COLUMN "contactPerson" DROP NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "suppliers" 
            ALTER COLUMN "contactPerson" SET NOT NULL
        `);
    }

}
