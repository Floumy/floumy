import { MigrationInterface, QueryRunner } from "typeorm";

export class AddColumnsToGitlabMR1748004956107 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE gitlab_merge_request
                ADD COLUMN "mergedAt"   timestamp,
                ADD COLUMN "closedAt"   timestamp,
                ADD COLUMN "approvedAt" timestamp
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE gitlab_merge_request
                DROP COLUMN "mergedAt",
                DROP COLUMN "closedAt",
                DROP COLUMN "approvedAt"
        `);
    }

}
