import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddObjectiveComment1723835307269 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "objective_comment"
       (
           "id"          uuid              NOT NULL DEFAULT uuid_generate_v4(),
           "content"     character varying NOT NULL,
           "createdAt"   TIMESTAMP         NOT NULL DEFAULT now(),
           "updatedAt"   TIMESTAMP         NOT NULL DEFAULT now(),
           "createdById" uuid,
           "objectiveId" uuid,
           "orgId"       uuid,
           CONSTRAINT "PK_OBJECTIVE_COMMENT_ID" PRIMARY KEY ("id")
       )`,
    );
    await queryRunner.query(
      `ALTER TABLE "objective_comment"
          ADD CONSTRAINT "FK_OBJECTIVE_COMMENT_CREATED_BY_ID" FOREIGN KEY ("createdById") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "objective_comment"
          ADD CONSTRAINT "FK_OBJECTIVE_COMMENT_OBJECTIVE_ID" FOREIGN KEY ("objectiveId") REFERENCES "objective" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "objective_comment"
          ADD CONSTRAINT "FK_OBJECTIVE_COMMENT_ORG_ID" FOREIGN KEY ("orgId") REFERENCES "org" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "objective_comment"
          DROP CONSTRAINT "FK_OBJECTIVE_COMMENT_CREATED_BY_ID"`,
    );
    await queryRunner.query(
      `ALTER TABLE "objective_comment"
          DROP CONSTRAINT "FK_OBJECTIVE_COMMENT_OBJECTIVE_ID"`,
    );
    await queryRunner.query(
      `ALTER TABLE "objective_comment"
          DROP CONSTRAINT "FK_OBJECTIVE_COMMENT_ORG_ID"`,
    );
    await queryRunner.query(`DROP TABLE "objective_comment"`);
  }
}
