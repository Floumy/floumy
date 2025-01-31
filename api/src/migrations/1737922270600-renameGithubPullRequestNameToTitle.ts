import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameGithubPullRequestNameToTitle1737922270600
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "github_pull_request"
            RENAME COLUMN "name" TO "title";
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "github_pull_request"
            RENAME COLUMN "title" TO "name";
        `);
  }
}
