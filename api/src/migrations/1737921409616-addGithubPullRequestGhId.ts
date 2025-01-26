import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGithubPullRequestGhId1737921409616
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "github_pull_request"
            ADD COLUMN IF NOT EXISTS "githubId" character varying;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "github_pull_request"
            DROP COLUMN IF EXISTS "githubId";
        `);
  }
}
