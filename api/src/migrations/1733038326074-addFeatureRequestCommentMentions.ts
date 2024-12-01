import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFeatureRequestCommentMentions1733038326074
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "feature_request_comment_mentions"
                                 (
                                     "featureRequestCommentId" uuid NOT NULL,
                                     "userId" uuid NOT NULL,
                                     CONSTRAINT "PK_FEATURE_REQUEST_COMMENT_MENTIONS" PRIMARY KEY ("featureRequestCommentId", "userId")
                                 )`);
    await queryRunner.query(`ALTER TABLE "feature_request_comment_mentions"
            ADD CONSTRAINT "FK_FEATURE_REQUEST_COMMENT_MENTIONS_FEATURE_COMMENT_COMMENT_ID" FOREIGN KEY ("featureRequestCommentId") REFERENCES "feature_request_comment" ("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    await queryRunner.query(`ALTER TABLE "feature_request_comment_mentions"
        ADD CONSTRAINT "FK_FEATURE_REQUEST_COMMENT_MENTIONS_USER_USER_ID" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "feature_request_comment_mentions"`);
  }
}
