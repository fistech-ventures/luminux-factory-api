import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds invoice support to sales:
 * - invoiceNo: sequential human-readable number (e.g. INV-0001), generated
 *   from a dedicated PG sequence so concurrent sales never collide.
 * - invoiceUrl: public URL of the auto-generated invoice PDF (stored on
 *   Cloudflare R2), null when generation has not run yet.
 *
 * Both are nullable because existing rows have no invoice, and the PDF
 * generation is non-fatal if storage is unavailable.
 */
export class AddInvoiceToSales1788800000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS "sales_invoice_seq"`);
    await queryRunner.query(`ALTER TABLE "sales" ADD COLUMN IF NOT EXISTS "invoiceNo" varchar(50)`);
    await queryRunner.query(`ALTER TABLE "sales" ADD COLUMN IF NOT EXISTS "invoiceUrl" text`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_sales_invoiceNo" ON "sales" ("invoiceNo")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_sales_invoiceNo"`);
    await queryRunner.query(`ALTER TABLE "sales" DROP COLUMN "invoiceUrl"`);
    await queryRunner.query(`ALTER TABLE "sales" DROP COLUMN "invoiceNo"`);
    await queryRunner.query(`DROP SEQUENCE IF EXISTS "sales_invoice_seq"`);
  }
}