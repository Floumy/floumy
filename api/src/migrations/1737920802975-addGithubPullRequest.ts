import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGithubPullRequest1737920802975 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE "github_pull_request"
        (
            "id"        uuid              NOT NULL DEFAULT uuid_generate_v4(),
            "name"      character varying NOT NULL,
            "url"       character varying NOT NULL,
            "state"     character varying NOT NULL,
            "createdAt" TIMESTAMP         NOT NULL,
            "updatedAt" TIMESTAMP         NOT NULL,
            "orgId"     uuid,
            "projectId" uuid,
            "workItemId" uuid,
            CONSTRAINT "PK_GITHUB_PULL_REQUEST" PRIMARY KEY ("id")
        )
    `);
    await queryRunner.query(`
        ALTER TABLE "github_pull_request"
            ADD CONSTRAINT "FK_GITHUB_PULL_REQUEST_ORG"
                FOREIGN KEY ("orgId") REFERENCES "org" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
        ALTER TABLE "github_pull_request"
            ADD CONSTRAINT "FK_GITHUB_PULL_REQUEST_PROJECT"
                FOREIGN KEY ("projectId") REFERENCES "project" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
        ALTER TABLE "github_pull_request"
            ADD CONSTRAINT "FK_GITHUB_PULL_REQUEST_WORK_ITEM"
                FOREIGN KEY ("workItemId") REFERENCES "work_item" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "github_pull_request"`);
  }
}
