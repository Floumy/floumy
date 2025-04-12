import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameGitlabPullRequestToMergeRequest1742503800202
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "gitlab_pull_request" RENAME TO "gitlab_merge_request"`,
    );
    await queryRunner.query(
      `ALTER TABLE "gitlab_merge_request" DROP COLUMN "gitlabId"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "gitlab_merge_request" ADD "gitlabId" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "gitlab_merge_request" RENAME TO "gitlab_pull_request"`,
    );
  }
}
