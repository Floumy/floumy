import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFeatureDescriptionMentions1733984276012
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "feature_description_mentions"
            (
                "featureId" uuid NOT NULL,
                "userId" uuid NOT NULL,
                CONSTRAINT "PK_FEATURE_DESCRIPTION_MENTIONS" PRIMARY KEY ("featureId", "userId")
            )`);

    await queryRunner.query(`ALTER TABLE "feature_description_mentions"
            ADD CONSTRAINT "FK_FEATURE_DESCRIPTION_MENTIONS_FEATURE_FEATURE_ID" FOREIGN KEY ("featureId") REFERENCES "feature" ("id") ON DELETE CASCADE ON UPDATE CASCADE`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "feature_description_mentions"`);
  }
}
