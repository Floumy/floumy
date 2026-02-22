import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameFeatureRequestToRequest1760000000003
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Rename feature_request_status_enum to request_status_enum
    await queryRunner.query(
      `ALTER TYPE "feature_request_status_enum" RENAME TO "request_status_enum"`,
    );

    // 2. Rename feature_request table to request
    await queryRunner.query(
      `ALTER TABLE "feature_request" RENAME TO "request"`,
    );

    // 3. Rename feature_request_comment column and table
    await queryRunner.query(`
      ALTER TABLE "feature_request_comment"
        RENAME COLUMN "featureRequestId" TO "requestId"
    `);
    await queryRunner.query(
      `ALTER TABLE "feature_request_comment" RENAME TO "request_comment"`,
    );

    // 4. Rename feature_request_comment_mentions columns and table
    await queryRunner.query(`
      ALTER TABLE "feature_request_comment_mentions"
        RENAME COLUMN "featureRequestCommentId" TO "requestCommentId"
    `);
    await queryRunner.query(
      `ALTER TABLE "feature_request_comment_mentions" RENAME TO "request_comment_mentions"`,
    );

    // 5. Rename feature_request_vote column and table
    await queryRunner.query(`
      ALTER TABLE "feature_request_vote"
        RENAME COLUMN "featureRequestId" TO "requestId"
    `);
    await queryRunner.query(
      `ALTER TABLE "feature_request_vote" RENAME TO "request_vote"`,
    );

    // 6. Rename initiative.featureRequestId to requestId
    await queryRunner.query(`
      ALTER TABLE "initiative"
        RENAME COLUMN "featureRequestId" TO "requestId"
    `);

    // 7. Rename bip_settings column
    await queryRunner.query(`
      ALTER TABLE "bip_settings"
        RENAME COLUMN "isFeatureRequestsPagePublic" TO "isRequestsPagePublic"
    `);

    // 8. Update notification entity enum
    await queryRunner.query(
      `ALTER TYPE "notification_entity_enum" RENAME TO "notification_entity_enum_old"`,
    );
    await queryRunner.query(`
      CREATE TYPE "notification_entity_enum" AS ENUM(
        'initiative_comment',
        'initiative_description',
        'request_comment',
        'issue_comment',
        'key_result_comment',
        'objective_comment',
        'work_item_comment',
        'work_item_description'
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "notification"
        ALTER COLUMN "entity" TYPE "notification_entity_enum" USING (
          CASE "entity"::text
            WHEN 'feature_request_comment' THEN 'request_comment'::notification_entity_enum
            ELSE "entity"::text::notification_entity_enum
          END
        )
    `);
    await queryRunner.query(`DROP TYPE "notification_entity_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 9. Revert notification entity enum
    await queryRunner.query(
      `ALTER TYPE "notification_entity_enum" RENAME TO "notification_entity_enum_old"`,
    );
    await queryRunner.query(`
      CREATE TYPE "notification_entity_enum" AS ENUM(
        'initiative_comment',
        'initiative_description',
        'feature_request_comment',
        'issue_comment',
        'key_result_comment',
        'objective_comment',
        'work_item_comment',
        'work_item_description'
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "notification"
        ALTER COLUMN "entity" TYPE "notification_entity_enum" USING (
          CASE "entity"::text
            WHEN 'request_comment' THEN 'feature_request_comment'::notification_entity_enum
            ELSE "entity"::text::notification_entity_enum
          END
        )
    `);
    await queryRunner.query(`DROP TYPE "notification_entity_enum_old"`);

    // 8. Revert bip_settings column
    await queryRunner.query(`
      ALTER TABLE "bip_settings"
        RENAME COLUMN "isRequestsPagePublic" TO "isFeatureRequestsPagePublic"
    `);

    // 7. Revert initiative column
    await queryRunner.query(`
      ALTER TABLE "initiative"
        RENAME COLUMN "requestId" TO "featureRequestId"
    `);

    // 6. Revert request_vote
    await queryRunner.query(
      `ALTER TABLE "request_vote" RENAME TO "feature_request_vote"`,
    );
    await queryRunner.query(`
      ALTER TABLE "feature_request_vote"
        RENAME COLUMN "requestId" TO "featureRequestId"
    `);

    // 5. Revert request_comment_mentions
    await queryRunner.query(
      `ALTER TABLE "request_comment_mentions" RENAME TO "feature_request_comment_mentions"`,
    );
    await queryRunner.query(`
      ALTER TABLE "feature_request_comment_mentions"
        RENAME COLUMN "requestCommentId" TO "featureRequestCommentId"
    `);

    // 4. Revert request_comment
    await queryRunner.query(
      `ALTER TABLE "request_comment" RENAME TO "feature_request_comment"`,
    );
    await queryRunner.query(`
      ALTER TABLE "feature_request_comment"
        RENAME COLUMN "requestId" TO "featureRequestId"
    `);

    // 2. Revert request table
    await queryRunner.query(`ALTER TABLE "request" RENAME TO "feature_request"`);

    // 1. Revert request_status_enum
    await queryRunner.query(
      `ALTER TYPE "request_status_enum" RENAME TO "feature_request_status_enum"`,
    );
  }
}
