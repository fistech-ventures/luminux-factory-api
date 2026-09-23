import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Employee module migration.
 *
 *   1. Creates the "employees" table.
 *   2. Adds the nullable "employeeId" column to "expenses" so an expense can be
 *      booked against the employee who spent it out of their advance.
 *   3. Makes "expenses.spentBy" nullable (it is auto-filled from the employee
 *      name when employeeId is provided).
 *
 * Money given to an employee is recorded as a `payments` row with
 * entityType = 'employee' (ledger type 'advance'); expenses link back to the
 * employee id. All statements are idempotent so this is safe on fresh and
 * already-migrated databases.
 */
export class AddEmployeeModule1790121600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "employees" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "isActive" boolean NOT NULL DEFAULT true,
        "createdBy" jsonb DEFAULT '{}'::jsonb,
        "updatedBy" jsonb DEFAULT '{}'::jsonb,
        "deletedBy" jsonb DEFAULT '{}'::jsonb,
        "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
        "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
        "deletedAt" timestamp without time zone,
        "name" varchar(255) NOT NULL,
        "employeeId" varchar(100) NOT NULL UNIQUE,
        "phoneNumber" varchar(20) NOT NULL,
        "email" varchar(150),
        "designation" varchar(255),
        PRIMARY KEY ("id")
      );
    `);

    await queryRunner.query(
      `ALTER TABLE "expenses" ADD COLUMN IF NOT EXISTS "employeeId" uuid;`,
    );
    await queryRunner.query(
      `ALTER TABLE "expenses" ALTER COLUMN "spentBy" DROP NOT NULL;`,
    );

    // FK is added separately so the migration stays idempotent (a constraint
    // can't be expressed with IF NOT EXISTS in older Postgres versions).
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "expenses"
          ADD CONSTRAINT "FK_expenses_employeeId"
          FOREIGN KEY ("employeeId") REFERENCES "employees" ("id") ON DELETE SET NULL;
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_expenses_employeeId" ON "expenses" ("employeeId");`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_expenses_employeeId";`);
    await queryRunner.query(
      `ALTER TABLE "expenses" DROP CONSTRAINT IF EXISTS "FK_expenses_employeeId";`,
    );
    await queryRunner.query(`ALTER TABLE "expenses" DROP COLUMN IF EXISTS "employeeId";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "employees";`);
  }
}
