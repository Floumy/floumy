import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropFeedTable1756065180148 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "feed_item"');
  }
  public async down(queryRunner: QueryRunner): Promise<void> {}
}
