import { MigrationInterface, QueryRunner } from 'typeorm';

export class RefactorPaymentColumnsOnOrg1717444963285
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "org"
            DROP COLUMN "isTrial",
            DROP COLUMN "trialEndDate",
            DROP COLUMN "isPaid",
            DROP COLUMN "isPendingPayment",
            DROP COLUMN "isSuspended",
            ADD COLUMN "stripeCustomerId" VARCHAR,
            ADD COLUMN "isSubscribed"     BOOLEAN DEFAULT FALSE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "org"
            ADD COLUMN "isTrial"          BOOLEAN DEFAULT FALSE,
            ADD COLUMN "trialEndDate"     TIMESTAMP,
            ADD COLUMN "isPaid"           BOOLEAN DEFAULT FALSE,
            ADD COLUMN "isPendingPayment" BOOLEAN DEFAULT FALSE,
            ADD COLUMN "isSuspended"      BOOLEAN DEFAULT FALSE,
            DROP COLUMN "stripeCustomerId",
            DROP COLUMN "isSubscribed"
    `);
  }
}
