import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDeleteCascadeToAllComments1731853411380
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop the delete cascade constraint from all comments
    await queryRunner.query(`
        ALTER TABLE "work_item_comment"
            DROP CONSTRAINT "FK_WORK_ITEM_COMMENT_WORK_ITEM_ID"
    `);
    await queryRunner.query(`
        ALTER TABLE "feature_comment"
            DROP CONSTRAINT "FK_FEATURE_COMMENT_FEATURE_ID"
    `);
    await queryRunner.query(`
        ALTER TABLE "key_result_comment"
            DROP CONSTRAINT "FK_KEY_RESULT_COMMENT_KEY_RESULT_ID"
    `);
    await queryRunner.query(`
        ALTER TABLE "objective_comment"
            DROP CONSTRAINT "FK_OBJECTIVE_COMMENT_OBJECTIVE_ID"
    `);
    await queryRunner.query(`
        ALTER TABLE "feature_request_comment"
            DROP CONSTRAINT "FK_FEATURE_REQUEST_COMMENT_FEATURE_REQUEST_ID"
    `);
    await queryRunner.query(
      `ALTER TABLE "issue_comment"
          DROP CONSTRAINT "FK_ISSUE_COMMENT_ISSUE_ID"`,
    );

    // Add the delete cascade constraint to all comments
    await queryRunner.query(`
        ALTER TABLE "work_item_comment"
            ADD CONSTRAINT "FK_WORK_ITEM_COMMENT_WORK_ITEM_ID" FOREIGN KEY ("workItemId") REFERENCES "work_item" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
        ALTER TABLE "feature_comment"
            ADD CONSTRAINT "FK_FEATURE_COMMENT_FEATURE_ID" FOREIGN KEY ("featureId") REFERENCES "feature" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
        ALTER TABLE "key_result_comment"
            ADD CONSTRAINT "FK_KEY_RESULT_COMMENT_KEY_RESULT_ID" FOREIGN KEY ("keyResultId") REFERENCES "key_result" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
        ALTER TABLE "objective_comment"
            ADD CONSTRAINT "FK_OBJECTIVE_COMMENT_OBJECTIVE_ID" FOREIGN KEY ("objectiveId") REFERENCES "objective" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
        ALTER TABLE "issue_comment"
            ADD CONSTRAINT "FK_ISSUE_COMMENT_ISSUE_ID" FOREIGN KEY ("issueId") REFERENCES "issue" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
        ALTER TABLE "feature_request_comment"
            ADD CONSTRAINT "FK_FEATURE_REQUEST_COMMENT_FEATURE_REQUEST_ID" FOREIGN KEY ("featureRequestId") REFERENCES "feature_request" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
