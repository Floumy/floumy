import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStripeSubscriptionIdColumnToOrgs1718481611310
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "org"
        ADD "stripeSubscriptionId" character varying`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "org"
        DROP COLUMN "stripeSubscriptionId"`);
  }
}
