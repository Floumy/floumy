import { MigrationInterface, QueryRunner } from 'typeorm';

export class SetFinalFeatureRequestStatuses1725044457665
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."feature_request_status_enum" RENAME TO "feature_request_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "feature_request_status_enum" AS ENUM('pending', 'approved', 'planned', 'ready-to-start', 'in-progress', 'completed', 'closed')`,
    );
    await queryRunner.query(
      `ALTER TABLE "feature_request"
          ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "feature_request"
          ALTER COLUMN "status" TYPE "feature_request_status_enum" USING "status"::"text"::"feature_request_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "feature_request"
          ALTER COLUMN "status" SET DEFAULT 'pending'`,
    );
    await queryRunner.query(`DROP TYPE "feature_request_status_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."feature_request_status_enum" RENAME TO "feature_request_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "feature_request_status_enum" AS ENUM('pending', 'approved', 'planned', 'ready_to_review', 'in_progress', 'completed', 'closed')`,
    );
    await queryRunner.query(
      `ALTER TABLE "feature_request"
          ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "feature_request"
          ALTER COLUMN "status" TYPE "feature_request_status_enum" USING "status"::"text"::"feature_request_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "feature_request"
          ALTER COLUMN "status" SET DEFAULT 'pending'`,
    );
    await queryRunner.query(`DROP TYPE "feature_request_status_enum_old"`);
  }
}
