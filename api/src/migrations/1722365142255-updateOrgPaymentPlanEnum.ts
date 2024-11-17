import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateOrgPaymentPlanEnum1722365142255
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE org_payment_plan_enum ADD VALUE 'premium' AFTER 'free';`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE org_payment_plan_enum DROP VALUE 'premium';`,
    );
  }
}
