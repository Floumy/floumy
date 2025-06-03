import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGitlabBranchDeletedAtColumn1748717583335
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "gitlab_branch" ADD COLUMN "deletedAt" TIMESTAMP`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "gitlab_branch" DROP COLUMN "deletedAt"`,
    );
  }
}
