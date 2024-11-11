import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAmountAndStripeInvoiceIdToInvoice1718826005536
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "invoice"
        ADD "amount" double precision NOT NULL DEFAULT 0`);
    await queryRunner.query(`ALTER TABLE "invoice"
        ADD "stripeInvoiceId" character varying NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "invoice"
        DROP COLUMN "amount"`);
    await queryRunner.query(
      `ALTER TABLE "invoice"
          DROP COLUMN "stripeInvoiceId"`,
    );
  }
}
