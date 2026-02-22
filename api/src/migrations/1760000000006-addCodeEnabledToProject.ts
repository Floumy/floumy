import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCodeEnabledToProject1760000000006
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "project" ADD COLUMN "codeEnabled" boolean NOT NULL DEFAULT false`,
    );
    // Set codeEnabled = true for existing projects that have a code connection
    await queryRunner.query(
      `UPDATE "project" SET "codeEnabled" = true WHERE "githubRepositoryId" IS NOT NULL OR "gitlabProjectId" IS NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "project" DROP COLUMN "codeEnabled"`);
  }
}
