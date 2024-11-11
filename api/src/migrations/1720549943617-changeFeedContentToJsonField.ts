import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeFeedContentToJsonField1720549943617
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "feed_item"
        DROP COLUMN "content"`);
    await queryRunner.query(`ALTER TABLE "feed_item"
        ADD "content" json NOT NULL default '{}'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "feed_item"
        DROP COLUMN "content"`);
    await queryRunner.query(`ALTER TABLE "feed_item"
        ADD "content" character varying NOT NULL`);
  }
}
