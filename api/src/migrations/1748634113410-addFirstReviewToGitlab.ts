import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFirstReviewToGitlab1748634113410 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "gitlab_merge_request"
            ADD COLUMN "firstReviewAt" TIMESTAMP;
        `);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "gitlab_merge_request"
            DROP COLUMN "firstReviewAt";
        `);
    }

}
