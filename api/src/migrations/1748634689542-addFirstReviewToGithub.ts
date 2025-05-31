import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFirstReviewToGithub1748634689542 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "github_pull_request"
            ADD COLUMN "firstReviewAt" TIMESTAMP;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "github_pull_request"
            DROP COLUMN "firstReviewAt";
        `);
    }

}
