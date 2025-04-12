import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGitlabProjectToProject1740604617615
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "project" ADD "gitlabProjectId" text`);
    await queryRunner.query(
      `ALTER TABLE "project" ADD "gitlabProjectUrl" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "project" ADD "gitlabProjectName" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "project" DROP COLUMN "gitlabProjectId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "project" DROP COLUMN "gitlabProjectUrl"`,
    );
    await queryRunner.query(
      `ALTER TABLE "project" DROP COLUMN "gitlabProjectName"`,
    );
  }
}
