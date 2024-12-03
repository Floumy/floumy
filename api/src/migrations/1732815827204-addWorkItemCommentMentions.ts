import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWorkItemCommentMentions1732815827204
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE "work_item_comment_mentions"
        (
            "workItemCommentId" uuid NOT NULL,
            "userId" uuid NOT NULL,
            CONSTRAINT "PK_WORK_ITEM_COMMENT_MENTIONS" PRIMARY KEY ("workItemCommentId", "userId")
        )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "work_item_comment_mentions"`);
  }
}
