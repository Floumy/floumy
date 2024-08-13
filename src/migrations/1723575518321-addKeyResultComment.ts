import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddKeyResultComment1723575518321 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "key_result_comment"
       (
           "id"          uuid              NOT NULL DEFAULT uuid_generate_v4(),
           "content"     character varying NOT NULL,
           "createdAt"   TIMESTAMP         NOT NULL DEFAULT now(),
           "updatedAt"   TIMESTAMP         NOT NULL DEFAULT now(),
           "createdById" uuid,
           "keyResultId" uuid,
           "orgId"       uuid,
           CONSTRAINT "PK_KEY_RESULT_COMMENT_ID" PRIMARY KEY ("id")
       )`,
    );
    await queryRunner.query(
      `ALTER TABLE "key_result_comment"
          ADD CONSTRAINT "FK_KEY_RESULT_COMMENT_CREATED_BY_ID" FOREIGN KEY ("createdById") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "key_result_comment"
          ADD CONSTRAINT "FK_KEY_RESULT_COMMENT_KEY_RESULT_ID" FOREIGN KEY ("keyResultId") REFERENCES "key_result" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "key_result_comment"
          ADD CONSTRAINT "FK_KEY_RESULT_COMMENT_ORG_ID" FOREIGN KEY ("orgId") REFERENCES "org" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "key_result_comment"
          DROP CONSTRAINT "FK_KEY_RESULT_COMMENT_CREATED_BY_ID"`,
    );
    await queryRunner.query(
      `ALTER TABLE "key_result_comment"
          DROP CONSTRAINT "FK_KEY_RESULT_COMMENT_KEY_RESULT_ID"`,
    );
    await queryRunner.query(
      `ALTER TABLE "key_result_comment"
          DROP CONSTRAINT "FK_KEY_RESULT_COMMENT_ORG_ID"`,
    );
    await queryRunner.query(`DROP TABLE "key_result_comment"`);
  }
}
