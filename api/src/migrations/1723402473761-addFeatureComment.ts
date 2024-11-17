import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFeatureComment1723402473761 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "feature_comment"
       (
           "id"          uuid              NOT NULL DEFAULT uuid_generate_v4(),
           "content"     character varying NOT NULL,
           "createdAt"   TIMESTAMP         NOT NULL DEFAULT now(),
           "updatedAt"   TIMESTAMP         NOT NULL DEFAULT now(),
           "createdById" uuid,
           "featureId"   uuid,
           "orgId"       uuid,
           CONSTRAINT "PK_FEATURE_COMMENT_ID" PRIMARY KEY ("id")
       )`,
    );
    await queryRunner.query(
      `ALTER TABLE "feature_comment"
          ADD CONSTRAINT "FK_FEATURE_COMMENT_CREATED_BY_ID" FOREIGN KEY ("createdById") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "feature_comment"
          ADD CONSTRAINT "FK_FEATURE_COMMENT_FEATURE_ID" FOREIGN KEY ("featureId") REFERENCES "feature" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "feature_comment"
          ADD CONSTRAINT "FK_FEATURE_COMMENT_ORG_ID" FOREIGN KEY ("orgId") REFERENCES "org" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "feature_comment"
          DROP CONSTRAINT "FK_FEATURE_COMMENT_CREATED_BY_ID"`,
    );
    await queryRunner.query(
      `ALTER TABLE "feature_comment"
          DROP CONSTRAINT "FK_FEATURE_COMMENT_FEATURE_ID"`,
    );
    await queryRunner.query(
      `ALTER TABLE "feature_comment"
          DROP CONSTRAINT "FK_FEATURE_COMMENT_ORG_ID"`,
    );
    await queryRunner.query(`DROP TABLE "feature_comment"`);
  }
}
