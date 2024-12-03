import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIssueCommentMentions1733040566382
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "issue_comment_mentions"
                                    (
                                        "issueCommentId" uuid NOT NULL,
                                        "userId" uuid NOT NULL,
                                        CONSTRAINT "PK_ISSUE_COMMENT_MENTIONS" PRIMARY KEY ("issueCommentId", "userId")
                                    )`);
    await queryRunner.query(`ALTER TABLE "issue_comment_mentions"
                ADD CONSTRAINT "FK_ISSUE_COMMENT_MENTIONS_ISSUE_COMMENT_COMMENT_ID" FOREIGN KEY ("issueCommentId") REFERENCES "issue_comment" ("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    await queryRunner.query(`ALTER TABLE "issue_comment_mentions"
            ADD CONSTRAINT "FK_ISSUE_COMMENT_MENTIONS_USER_USER_ID" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "issue_comment_mentions"`);
  }
}
