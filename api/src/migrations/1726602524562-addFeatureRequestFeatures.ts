import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFeatureRequestFeatures1726602524562
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "feature"
        ADD "featureRequestId" uuid`);
    await queryRunner.query(`ALTER TABLE "feature"
        ADD CONSTRAINT "FK_FEATURE_FEATURE_REQUEST_ID" FOREIGN KEY ("featureRequestId") REFERENCES "feature_request" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "feature"
        DROP CONSTRAINT "FK_FEATURE_FEATURE_REQUEST_ID"`);
    await queryRunner.query(`ALTER TABLE "feature"
        DROP COLUMN "featureRequestId"`);
    await queryRunner.query(`ALTER TABLE "feature_request"
        DROP COLUMN "featureId"`);
  }
}
