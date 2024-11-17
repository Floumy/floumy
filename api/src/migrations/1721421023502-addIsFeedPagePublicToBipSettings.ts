import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsFeedPagePublicToBipSettings1721421023502
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "bip_settings"
        ADD "isFeedPagePublic" boolean NOT NULL DEFAULT false`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "bip_settings"
        DROP COLUMN "isFeedPagePublic"`);
  }
}
