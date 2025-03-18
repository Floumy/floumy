import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGitlabBranchAndPullRequest1742332212924
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "gitlab_branch"
       (
           "id"         uuid              NOT NULL DEFAULT uuid_generate_v4(),
           "name"       character varying NOT NULL,
           "url"        character varying NOT NULL,
           "state"      character varying NOT NULL,
           "createdAt"  TIMESTAMP         NOT NULL DEFAULT now(),
           "updatedAt"  TIMESTAMP         NOT NULL DEFAULT now(),
           "projectId"  uuid,
           "orgId"      uuid,
           "workItemId" uuid,
           CONSTRAINT "PK_GITLAB_BRANCH" PRIMARY KEY ("id")
       )`,
    );
    await queryRunner.query(
      `CREATE TABLE "gitlab_pull_request"
       (
           "id"         uuid              NOT NULL DEFAULT uuid_generate_v4(),
           "gitlabId"   character varying NOT NULL,
           "title"      character varying NOT NULL,
           "url"        character varying NOT NULL,
           "state"      character varying NOT NULL,
           "createdAt"  TIMESTAMP         NOT NULL DEFAULT now(),
           "updatedAt"  TIMESTAMP         NOT NULL DEFAULT now(),
           "projectId"  uuid,
           "orgId"      uuid,
           "workItemId" uuid,
           CONSTRAINT "PK_GITLAB_PULL_REQUEST" PRIMARY KEY ("id")
       )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "gitlab_branch"`);
    await queryRunner.query(`DROP TABLE "gitlab_pull_request"`);
  }
}
