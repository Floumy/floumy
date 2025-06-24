import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameProjectToProject1732132501100 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "product"
            RENAME TO "project"
    `);
    await queryRunner.query(`
        ALTER TABLE "bip_settings"
            RENAME COLUMN "productId" TO "projectId"
    `);
    await queryRunner.query(`
        ALTER TABLE "objective"
            RENAME COLUMN "productId" TO "projectId"
    `);
    await queryRunner.query(`
        ALTER TABLE "key_result"
            RENAME COLUMN "productId" TO "projectId"
    `);
    await queryRunner.query(`
        ALTER TABLE "feature"
            RENAME COLUMN "productId" TO "projectId"
    `);
    await queryRunner.query(`
        ALTER TABLE "milestone"
            RENAME COLUMN "productId" TO "projectId"
    `);
    await queryRunner.query(`
        ALTER TABLE "work_item"
            RENAME COLUMN "productId" TO "projectId"
    `);
    await queryRunner.query(`
        ALTER TABLE "iteration"
            RENAME COLUMN "productId" TO "projectId"
    `);
    await queryRunner.query(`
        ALTER TABLE "file"
            RENAME COLUMN "productId" TO "projectId"
    `);
    await queryRunner.query(`
        ALTER TABLE "feed_item"
            RENAME COLUMN "productId" TO "projectId"
    `);
    await queryRunner.query(`
        ALTER TABLE "feature_request"
            RENAME COLUMN "productId" TO "projectId"
    `);
    await queryRunner.query(`
        ALTER TABLE "issue"
            RENAME COLUMN "productId" TO "projectId"
    `);
    await queryRunner.query(`
        ALTER TABLE "product_user" RENAME TO "project_user"
    `);
    await queryRunner.query(`
        ALTER TABLE "project_user"
            RENAME COLUMN "productId" TO "projectId"
    `);
  }

  /* eslint-disable */
  public async down(queryRunner: QueryRunner): Promise<void> {
    throw new Error('This migration cannot be reversed');
  }
    /* eslint-enable */
}
