import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddKeyResultCommentMentions1733040863599
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "key_result_comment_mentions"
                                    (
                                        "keyResultCommentId" uuid NOT NULL,
                                        "userId" uuid NOT NULL,
                                        CONSTRAINT "PK_KEY_RESULT_COMMENT_MENTIONS" PRIMARY KEY ("keyResultCommentId", "userId")
                                    )`);
    await queryRunner.query(`ALTER TABLE "key_result_comment_mentions"
                ADD CONSTRAINT "FK_KEY_RESULT_COMMENT_MENTIONS_KEY_RESULT_COMMENT_COMMENT_ID" FOREIGN KEY ("keyResultCommentId") REFERENCES "key_result_comment" ("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    await queryRunner.query(`ALTER TABLE "key_result_comment_mentions"
            ADD CONSTRAINT "FK_KEY_RESULT_COMMENT_MENTIONS_USER_USER_ID" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "key_result_comment_mentions"`);
  }
}
