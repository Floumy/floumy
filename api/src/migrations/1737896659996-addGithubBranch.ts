import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGithubBranch1737896659996 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "github_branch"
            (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "url" character varying NOT NULL,
                "state" character varying NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "orgId" uuid,
                "projectId" uuid,
                "workItemId" uuid,
                CONSTRAINT "PK_GITHUB_BRANCH" PRIMARY KEY ("id")
            )
        `);

    await queryRunner.query(`
            ALTER TABLE "github_branch"
            ADD CONSTRAINT "FK_GITHUB_BRANCH_ORG"
            FOREIGN KEY ("orgId") REFERENCES "org" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);

    await queryRunner.query(`
            ALTER TABLE "github_branch"
            ADD CONSTRAINT "FK_GITHUB_BRANCH_PROJECT"
            FOREIGN KEY ("projectId") REFERENCES "project" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);

    await queryRunner.query(`
            ALTER TABLE "github_branch"
            ADD CONSTRAINT "FK_GITHUB_BRANCH_WORK_ITEM"
            FOREIGN KEY ("workItemId") REFERENCES "work_item" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "github_branch"
            DROP CONSTRAINT "FK_GITHUB_BRANCH_ORG"
        `);

    await queryRunner.query(`
            ALTER TABLE "github_branch"
            DROP CONSTRAINT "FK_GITHUB_BRANCH_PROJECT"
        `);

    await queryRunner.query(`
            ALTER TABLE "github_branch"
            DROP CONSTRAINT "FK_GITHUB_BRANCH_WORK_ITEM"
        `);

    await queryRunner.query(`DROP TABLE "github_branch"`);
  }
}
