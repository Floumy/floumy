import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGithubColumns1737149873347 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "org"
            ADD "githubAccessToken" text,
            ADD "githubUsername" varchar;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "org"
            DROP COLUMN "githubAccessToken",
            DROP COLUMN "githubUsername";
        `);
  }
}
