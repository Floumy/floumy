import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFeatureRequestsVotes1725305398243
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "feature_request_vote"
                             (
                                 "id"               uuid      NOT NULL DEFAULT uuid_generate_v4(),
                                 "userId"           uuid      NOT NULL,
                                 "featureRequestId" uuid      NOT NULL,
                                 "vote"             integer   NOT NULL DEFAULT 0,
                                 "createdAt"        TIMESTAMP NOT NULL DEFAULT now(),
                                 "updatedAt"        TIMESTAMP NOT NULL DEFAULT now(),
                                 CONSTRAINT "PK_FRV" PRIMARY KEY ("id")
                             )`);
    await queryRunner.query(`ALTER TABLE "feature_request_vote"
        ADD CONSTRAINT "FK_FRV_USER_ID" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    await queryRunner.query(`ALTER TABLE "feature_request_vote"
        ADD CONSTRAINT "FK_FRV_FEATURE_ID" FOREIGN KEY ("featureRequestId") REFERENCES "feature_request" ("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    await queryRunner.query(
      `CREATE INDEX "IDX_FRV_USER_ID" ON "feature_request_vote" ("userId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_FRV_FEATURE_ID" ON "feature_request_vote" ("featureRequestId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "feature_request"
          ADD "votesCount" integer NOT NULL DEFAULT 1`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "feature_request_vote"
        DROP CONSTRAINT "FK_FRV_USER_ID"`);
    await queryRunner.query(`ALTER TABLE "feature_request_vote"
        DROP CONSTRAINT "FK_FRV_FEATURE_ID"`);
    await queryRunner.query(`DROP TABLE "feature_request_vote"`);
    await queryRunner.query(`DROP INDEX "IDX_FRV_USER_ID"`);
    await queryRunner.query(`DROP INDEX "IDX_FRV_FEATURE_ID"`);
    await queryRunner.query(`ALTER TABLE "feature_request"
        DROP COLUMN "votesCount"`);
  }
}
