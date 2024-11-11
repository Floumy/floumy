import { MigrationInterface, QueryRunner } from 'typeorm';

export class SetFeedItemEntityIdNullable1721677187277
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "feed_item"
        ALTER COLUMN "entityId" DROP NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "feed_item"
        ALTER COLUMN "entityId" SET NOT NULL`);
  }
}
