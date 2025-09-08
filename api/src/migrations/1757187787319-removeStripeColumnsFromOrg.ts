import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveStripeColumnsFromOrg1757187787319
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "org"
        DROP COLUMN "stripeCustomerId",
        DROP COLUMN "stripeSubscriptionId"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "org"
            ADD COLUMN "stripeCustomerId" VARCHAR,
            ADD COLUMN "stripeSubscriptionId" VARCHAR
        `);
  }
}
