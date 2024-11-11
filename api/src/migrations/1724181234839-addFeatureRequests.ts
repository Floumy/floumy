import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFeatureRequests1724181234839 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "feature_request_status_enum" AS ENUM('planned', 'ready_to_review', 'in_progress', 'completed', 'closed')`,
    );
    await queryRunner.query(`CREATE TABLE "feature_request"
                             (
                                 "id"          uuid                          NOT NULL DEFAULT uuid_generate_v4(),
                                 "title"       character varying             NOT NULL,
                                 "description" character varying             NOT NULL,
                                 "status"      "feature_request_status_enum" NOT NULL DEFAULT 'planned',
                                 "estimation"  integer,
                                 "completedAt" TIMESTAMP,
                                 "createdAt"   TIMESTAMP                     NOT NULL DEFAULT now(),
                                 "updatedAt"   TIMESTAMP                     NOT NULL DEFAULT now(),
                                 "createdById" uuid,
                                 "orgId"       uuid,
                                 CONSTRAINT "PK_FEATURE_REQUEST_ID" PRIMARY KEY ("id")
                             )`);
    await queryRunner.query(`ALTER TABLE "feature_request"
        ADD CONSTRAINT "FK_FEATURE_REQUEST_CREATED_BY_ID" FOREIGN KEY ("createdById")
            REFERENCES "user" ("id")
            ON DELETE CASCADE
            ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "feature_request"
        ADD CONSTRAINT "FK_FEATURE_REQUEST_ORG_ID" FOREIGN KEY ("orgId")
            REFERENCES "org" ("id")
            ON DELETE CASCADE
            ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "feature_request"
        DROP CONSTRAINT "FK_FEATURE_REQUEST_ORG_ID"`);
    await queryRunner.query(`ALTER TABLE "feature_request"
        DROP CONSTRAINT "FK_FEATURE_REQUEST_CREATED_BY_ID"`);
    await queryRunner.query(`DROP TABLE "feature_request"`);
    await queryRunner.query(`DROP TYPE "feature_request_status_enum"`);
  }
}
