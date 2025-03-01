import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGitlabProjectWebhookId1740859212490
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "project"
        ADD "gitlabProjectWebhookId" integer`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "project"
        DROP COLUMN "gitlabProjectWebhookId"`);
  }
}
