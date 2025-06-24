import { MigrationInterface, QueryRunner } from 'typeorm';

export class ModifyFeatureToInitiative1738867116360
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "feature" RENAME TO "initiative";`);

    await queryRunner.query(`
      ALTER TABLE feature_comment
        RENAME COLUMN "featureId" TO "initiativeId";
    `);
    await queryRunner.query(
      `ALTER TABLE "feature_comment" RENAME TO "initiative_comment";`,
    );
    await queryRunner.query(`
      ALTER TABLE feature_comment_mentions
        RENAME COLUMN "featureCommentId" TO "initiativeCommentId";
    `);
    await queryRunner.query(
      `ALTER TABLE "feature_comment_mentions" RENAME TO "initiative_comment_mentions";`,
    );
    await queryRunner.query(`
      ALTER TABLE feature_description_mentions
        RENAME COLUMN "featureId" TO "initiativeId";
    `);
    await queryRunner.query(
      `ALTER TABLE "feature_description_mentions" RENAME TO "initiative_description_mentions";`,
    );
    await queryRunner.query(`
      ALTER TABLE feature_file
        RENAME COLUMN "featureId" TO "initiativeId";
    `);
    await queryRunner.query(
      `ALTER TABLE "feature_file" RENAME TO "initiative_file";`,
    );
    await queryRunner.query(`
      ALTER TABLE work_item
        RENAME COLUMN "featureId" TO "initiativeId";
    `);
  }

  /* eslint-disable */
  public async down(queryRunner: QueryRunner): Promise<void> {}
    /* eslint-enable */
}
