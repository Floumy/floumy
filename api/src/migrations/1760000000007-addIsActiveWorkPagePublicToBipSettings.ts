import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsActiveWorkPagePublicToBipSettings1760000000007
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "bip_settings"
        ADD "isActiveWorkPagePublic" boolean NOT NULL DEFAULT false`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "bip_settings"
        DROP COLUMN "isActiveWorkPagePublic"`);
  }
}
