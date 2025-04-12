import { MigrationInterface, QueryRunner } from 'typeorm';

export class MoveGithubAndGitlabCredentialsFromOrgToProject1743281208056
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "project"
          ADD COLUMN "githubAccessToken" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "project"
          ADD COLUMN "githubUsername" varchar`,
    );
    await queryRunner.query(
      `UPDATE "project"
       SET "githubAccessToken" = (SELECT "githubAccessToken" FROM "org" WHERE "id" = "project"."orgId")`,
    );
    await queryRunner.query(
      `UPDATE "project"
       SET "githubUsername" = (SELECT "githubUsername" FROM "org" WHERE "id" = "project"."orgId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "org"
          DROP COLUMN "githubAccessToken"`,
    );
    await queryRunner.query(`ALTER TABLE "org"
        DROP COLUMN "githubUsername"`);

    await queryRunner.query(
      `ALTER TABLE "project"
          ADD "gitlabAccessToken" text`,
    );
    await queryRunner.query(
      `UPDATE "project"
       SET "gitlabAccessToken" = (SELECT "gitlabToken" FROM "org" WHERE "id" = "project"."orgId")`,
    );
    await queryRunner.query(`ALTER TABLE "org"
        DROP COLUMN "gitlabToken"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "org"
        ADD COLUMN "gitlabToken" text`);
    await queryRunner.query(`ALTER TABLE "org"
        ADD COLUMN "githubAccessToken" text`);
    await queryRunner.query(
      `UPDATE "org"
       SET "gitlabToken" = (SELECT "gitlabAccessToken" FROM "project" WHERE "id" = "org"."id")`,
    );
    await queryRunner.query(
      `UPDATE "org"
       SET githubUsername = (SELECT "githubUsername" FROM "project" WHERE "id" = "org"."id")`,
    );
    await queryRunner.query(
      `UPDATE "org"
       SET "githubAccessToken" = (SELECT "githubAccessToken" FROM "project" WHERE "id" = "org"."id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "project"
          DROP COLUMN "gitlabAccessToken"`,
    );
    await queryRunner.query(
      `ALTER TABLE "project"
          DROP COLUMN "githubAccessToken"`,
    );
    await queryRunner.query(
      `ALTER TABLE "project"
            DROP COLUMN "githubUsername"`,
    );
  }
}
