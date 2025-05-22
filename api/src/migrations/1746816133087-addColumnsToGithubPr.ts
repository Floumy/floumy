import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColumnsToGithubPr1746816133087 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
        ALTER TABLE github_pull_request
          ADD COLUMN "mergedAt"   timestamp,
          ADD COLUMN "closedAt"   timestamp,
          ADD COLUMN "approvedAt" timestamp
      `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
        ALTER TABLE github_pull_request
          DROP COLUMN "mergedAt",
          DROP COLUMN "closedAt",
          DROP COLUMN "approvedAt"`,
    );
  }
}
