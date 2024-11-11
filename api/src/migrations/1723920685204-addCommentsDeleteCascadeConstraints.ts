import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCommentsDeleteCascadeConstraints1723920685204
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "work_item_comment"
          DROP CONSTRAINT "FK_WORK_ITEM_COMMENT_WORK_ITEM_ID"`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_item_comment"
          ADD CONSTRAINT "FK_WORK_ITEM_COMMENT_WORK_ITEM_ID" FOREIGN KEY ("workItemId") REFERENCES "work_item" ("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "feature_comment"
          DROP CONSTRAINT "FK_FEATURE_COMMENT_FEATURE_ID"`,
    );
    await queryRunner.query(
      `ALTER TABLE "feature_comment"
          ADD CONSTRAINT "FK_FEATURE_COMMENT_FEATURE_ID" FOREIGN KEY ("featureId") REFERENCES "feature" ("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "key_result_comment"
          DROP CONSTRAINT "FK_KEY_RESULT_COMMENT_KEY_RESULT_ID"`,
    );
    await queryRunner.query(
      `ALTER TABLE "key_result_comment"
          ADD CONSTRAINT "FK_KEY_RESULT_COMMENT_KEY_RESULT_ID" FOREIGN KEY ("keyResultId") REFERENCES "key_result" ("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "objective_comment"
          DROP CONSTRAINT "FK_OBJECTIVE_COMMENT_OBJECTIVE_ID"`,
    );
    await queryRunner.query(
      `ALTER TABLE "objective_comment"
          ADD CONSTRAINT "FK_OBJECTIVE_COMMENT_OBJECTIVE_ID" FOREIGN KEY ("objectiveId") REFERENCES "objective" ("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "work_item_comment"
          DROP CONSTRAINT "FK_WORK_ITEM_COMMENT_WORK_ITEM_ID"`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_item_comment"
          ADD CONSTRAINT "FK_WORK_ITEM_COMMENT_WORK_ITEM_ID" FOREIGN KEY ("workItemId") REFERENCES "work_item" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "feature_comment"
          DROP CONSTRAINT "FK_FEATURE_COMMENT_FEATURE_ID"`,
    );
    await queryRunner.query(
      `ALTER TABLE "feature_comment"
          ADD CONSTRAINT "FK_FEATURE_COMMENT_FEATURE_ID" FOREIGN KEY ("featureId") REFERENCES "feature" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "key_result_comment"
          DROP CONSTRAINT "FK_KEY_RESULT_COMMENT_KEY_RESULT_ID"`,
    );
    await queryRunner.query(
      `ALTER TABLE "key_result_comment"
          ADD CONSTRAINT "FK_KEY_RESULT_COMMENT_KEY_RESULT_ID" FOREIGN KEY ("keyResultId") REFERENCES "key_result" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "objective_comment"
          DROP CONSTRAINT "FK_OBJECTIVE_COMMENT_OBJECTIVE_ID"`,
    );
    await queryRunner.query(
      `ALTER TABLE "objective_comment"
          ADD CONSTRAINT "FK_OBJECTIVE_COMMENT_OBJECTIVE_ID" FOREIGN KEY ("objectiveId") REFERENCES "objective" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
