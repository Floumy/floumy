import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropBipAndPaymentColumns1756066535355
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "org" DROP COLUMN "paymentPlan", DROP COLUMN "nextPaymentDate", DROP COLUMN "stripeCustomerId", DROP COLUMN "isSubscribed", DROP COLUMN "stripeSubscriptionId"',
    );
    await queryRunner.query('DROP TABLE "bip_settings"');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
