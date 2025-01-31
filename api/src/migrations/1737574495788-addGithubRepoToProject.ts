import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGithubRepoToProject1737574495788 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE project
            ADD COLUMN IF NOT EXISTS "githubRepositoryId" BIGINT;
            ALTER TABLE project
            ADD COLUMN IF NOT EXISTS "githubRepositoryFullName" VARCHAR;
            ALTER TABLE project
            ADD COLUMN IF NOT EXISTS "githubRepositoryUrl" VARCHAR;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE project
            DROP COLUMN IF EXISTS "githubRepositoryId";
            ALTER TABLE project
            DROP COLUMN IF EXISTS "githubRepositoryFullName";
            ALTER TABLE project
            DROP COLUMN IF EXISTS "githubRepositoryUrl";
        `);
  }
}
