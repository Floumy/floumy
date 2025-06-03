import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGithubBranchDeletedAtColumn1748717145793
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "github_branch" ADD COLUMN "deletedAt" TIMESTAMP;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "github_branch" DROP COLUMN "deletedAt";
        `);
  }
}
