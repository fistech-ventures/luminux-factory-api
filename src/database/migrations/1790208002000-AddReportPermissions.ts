import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddReportPermissions1790208002000 implements MigrationInterface {
  name = 'AddReportPermissions1790208002000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "permission_types" ("title")
      VALUES ('Reports')
      ON CONFLICT ("title") DO NOTHING
    `);

    await queryRunner.query(`
      INSERT INTO "permissions" ("title", "permissionTypeId")
      SELECT permission_title, permission_type."id"
      FROM (VALUES
        ('reports:read'),
        ('reports:write'),
        ('reports:update'),
        ('reports:delete')
      ) AS report_permissions(permission_title)
      CROSS JOIN "permission_types" permission_type
      WHERE permission_type."title" = 'Reports'
      ON CONFLICT ("title") DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "permissions"
      WHERE "title" IN ('reports:read', 'reports:write', 'reports:update', 'reports:delete')
    `);
    await queryRunner.query(`
      DELETE FROM "permission_types"
      WHERE "title" = 'Reports'
    `);
  }
}
