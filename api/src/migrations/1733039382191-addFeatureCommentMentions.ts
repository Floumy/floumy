import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFeatureCommentMentions1733039382191
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "feature_comment_mentions"
                                    (
                                        "featureCommentId" uuid NOT NULL,
                                        "userId" uuid NOT NULL,
                                        CONSTRAINT "PK_FEATURE_COMMENT_MENTIONS" PRIMARY KEY ("featureCommentId", "userId")
                                    )`);
    await queryRunner.query(`ALTER TABLE "feature_comment_mentions"
                ADD CONSTRAINT "FK_FEATURE_COMMENT_MENTIONS_FEATURE_COMMENT_COMMENT_ID" FOREIGN KEY ("featureCommentId") REFERENCES "feature_comment" ("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    await queryRunner.query(`ALTER TABLE "feature_comment_mentions"
            ADD CONSTRAINT "FK_FEATURE_COMMENT_MENTIONS_USER_USER_ID" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "feature_comment_mentions"`);
  }
}
