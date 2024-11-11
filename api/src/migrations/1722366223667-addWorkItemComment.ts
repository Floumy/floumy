import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWorkItemComment1722366223667 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "work_item_comment"
       (
           "id"          uuid              NOT NULL DEFAULT uuid_generate_v4(),
           "content"     character varying NOT NULL,
           "createdAt"   TIMESTAMP         NOT NULL DEFAULT now(),
           "updatedAt"   TIMESTAMP         NOT NULL DEFAULT now(),
           "createdById" uuid,
           "workItemId"  uuid,
           "orgId"       uuid,
           CONSTRAINT "PK_WORK_ITEM_COMMENT_ID" PRIMARY KEY ("id")
       )`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_item_comment"
          ADD CONSTRAINT "FK_WORK_ITEM_COMMENT_CREATED_BY_ID" FOREIGN KEY ("createdById") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_item_comment"
          ADD CONSTRAINT "FK_WORK_ITEM_COMMENT_WORK_ITEM_ID" FOREIGN KEY ("workItemId") REFERENCES "work_item" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_item_comment"
          ADD CONSTRAINT "FK_WORK_ITEM_COMMENT_ORG_ID" FOREIGN KEY ("orgId") REFERENCES "org" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "work_item_comment"
          DROP CONSTRAINT "FK_WORK_ITEM_COMMENT_CREATED_BY_ID"`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_item_comment"
          DROP CONSTRAINT "FK_WORK_ITEM_COMMENT_WORK_ITEM_ID"`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_item_comment"
          DROP CONSTRAINT "FK_WORK_ITEM_COMMENT_ORG_ID"`,
    );
    await queryRunner.query(`DROP TABLE "work_item_comment"`);
  }
}
