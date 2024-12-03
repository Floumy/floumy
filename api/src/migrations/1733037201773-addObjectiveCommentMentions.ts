import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddObjectiveCommentMentions1733037201773
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "objective_comment_mentions"
            (
                "objectiveCommentId" uuid NOT NULL,
                "userId" uuid NOT NULL,
                CONSTRAINT "PK_OBJECTIVE_COMMENT_MENTIONS" PRIMARY KEY ("objectiveCommentId", "userId")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "objective_comment_mentions"
                ADD CONSTRAINT "FK_OBJECTIVE_COMMENT_MENTIONS_OBJECTIVE_COMMENT_COMMENT_ID" FOREIGN KEY ("objectiveCommentId") REFERENCES "objective_comment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
    await queryRunner.query(`
            ALTER TABLE "objective_comment_mentions"
                ADD CONSTRAINT "FK_OBJECTIVE_COMMENT_MENTIONS_USER_USER_ID" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "objective_comment_mentions"`);
  }
}
