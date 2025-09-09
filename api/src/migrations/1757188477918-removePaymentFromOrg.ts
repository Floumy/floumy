import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemovePaymentFromOrg1757188477918 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "org"
        DROP COLUMN "paymentPlan",
        DROP COLUMN "nextPaymentDate",
        DROP COLUMN "isSubscribed"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "org"
            ADD COLUMN "paymentPlan" VARCHAR DEFAULT 'FREE',
            ADD COLUMN "nextPaymentDate" TIMESTAMP,
            ADD COLUMN "isSubscribed" BOOLEAN DEFAULT false
        `);
  }
}
