import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInvestments1791000000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "investments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "isActive" boolean NOT NULL DEFAULT true,
        "createdBy" jsonb DEFAULT '{}'::jsonb,
        "updatedBy" jsonb DEFAULT '{}'::jsonb,
        "deletedBy" jsonb DEFAULT '{}'::jsonb,
        "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
        "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
        "deletedAt" timestamp without time zone,
        "date" date NOT NULL,
        "title" varchar(255) NOT NULL,
        "investorId" uuid NOT NULL,
        "amount" double precision NOT NULL,
        CONSTRAINT "PK_investments_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_investments_investorId" FOREIGN KEY ("investorId") REFERENCES "employees" ("id") ON DELETE RESTRICT
      );
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_investments_investorId" ON "investments" ("investorId");`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_investments_date" ON "investments" ("date");`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_investments_date";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_investments_investorId";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "investments";`);
  }
}
