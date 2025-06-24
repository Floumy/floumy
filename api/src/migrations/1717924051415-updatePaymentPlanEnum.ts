import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdatePaymentPlanEnum1717924051415 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
ALTER TYPE org_payment_plan_enum ADD VALUE 'trial' AFTER 'build-in-public';
ALTER TYPE org_payment_plan_enum ADD VALUE 'free' AFTER 'trial';`);
  }

  /* eslint-disable */
  public async down(queryRunner: QueryRunner): Promise<void> {}
    /* eslint-enable */
}
