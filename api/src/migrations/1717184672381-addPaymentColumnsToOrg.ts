export class AddPaymentColumnsToOrg1717184672381 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "org_payment_plan_enum" AS ENUM('build-in-private', 'build-in-public')`,
    );
    await queryRunner.query(`ALTER TABLE "org"
        ADD COLUMN "paymentPlan" org_payment_plan_enum DEFAULT NULL`);
    await queryRunner.query(`ALTER TABLE "org"
        ADD COLUMN "isTrial" BOOLEAN DEFAULT false`);
    await queryRunner.query(`ALTER TABLE "org"
        ADD COLUMN "trialEndDate" TIMESTAMP DEFAULT null`);
    await queryRunner.query(`ALTER TABLE "org"
        ADD COLUMN "isPaid" BOOLEAN DEFAULT false`);
    await queryRunner.query(`ALTER TABLE "org"
        ADD COLUMN "nextPaymentDate" TIMESTAMP DEFAULT null`);
    await queryRunner.query(`ALTER TABLE "org"
        ADD COLUMN "isPendingPayment" BOOLEAN DEFAULT false`);
    await queryRunner.query(`ALTER TABLE "org"
        ADD COLUMN "isSuspended" BOOLEAN DEFAULT false`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "org"
        DROP COLUMN "paymentPlan"`);
    await queryRunner.query(`ALTER TABLE "org"
        DROP COLUMN "isTrial"`);
    await queryRunner.query(`ALTER TABLE "org"
        DROP COLUMN "trialEndDate"`);
    await queryRunner.query(`ALTER TABLE "org"
        DROP COLUMN "isPaid"`);
    await queryRunner.query(`ALTER TABLE "org"
        DROP COLUMN "nextPaymentDate"`);
    await queryRunner.query(`ALTER TABLE "org"
        DROP COLUMN "isPendingPayment"`);
    await queryRunner.query(`ALTER TABLE "org"
        DROP COLUMN "isSuspended"`);
    await queryRunner.query(`DROP TYPE "org_payment_plan_enum"`);
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';
