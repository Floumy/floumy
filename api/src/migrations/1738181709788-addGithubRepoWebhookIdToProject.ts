import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGithubRepoWebhookIdToProject1738181709788
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE project
            ADD COLUMN IF NOT EXISTS "githubRepositoryWebhookId" BIGINT;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE project
            DROP COLUMN IF EXISTS "githubRepositoryWebhookId";
        `);
  }
}
