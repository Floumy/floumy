import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIssueComment1726519132945 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE "issue_comment"
        (
            "id"          uuid              NOT NULL DEFAULT uuid_generate_v4(),
            "content"     character varying NOT NULL,
            "createdAt"   TIMESTAMP         NOT NULL DEFAULT now(),
            "updatedAt"   TIMESTAMP         NOT NULL DEFAULT now(),
            "createdById" uuid,
            "issueId"     uuid,
            "orgId"       uuid,
            CONSTRAINT "PK_ISSUE_COMMENT_ID" PRIMARY KEY ("id")
        )
    `);
    await queryRunner.query(`
        ALTER TABLE "issue_comment"
            ADD CONSTRAINT "FK_ISSUE_COMMENT_CREATED_BY_ID" FOREIGN KEY ("createdById") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
        ALTER TABLE "issue_comment"
            ADD CONSTRAINT "FK_ISSUE_COMMENT_ISSUE_ID" FOREIGN KEY ("issueId") REFERENCES "issue" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
        ALTER TABLE "issue_comment"
            ADD CONSTRAINT "FK_ISSUE_COMMENT_ORG_ID" FOREIGN KEY ("orgId") REFERENCES "org" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "issue_comment"
            DROP CONSTRAINT "FK_ISSUE_COMMENT_CREATED_BY_ID"
    `);
    await queryRunner.query(`
        ALTER TABLE "issue_comment"
            DROP CONSTRAINT "FK_ISSUE_COMMENT_ISSUE_ID"
    `);
    await queryRunner.query(`
        ALTER TABLE "issue_comment"
            DROP CONSTRAINT "FK_ISSUE_COMMENT_ORG_ID"
    `);
    await queryRunner.query(`DROP TABLE "issue_comment"`);
  }
}
