import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCyclesEnabledToProject1760000000005
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "project" ADD COLUMN "cyclesEnabled" boolean NOT NULL DEFAULT false`,
    );
    // Set cyclesEnabled = true for existing projects to preserve current behavior
    await queryRunner.query(`UPDATE "project" SET "cyclesEnabled" = true`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "project" DROP COLUMN "cyclesEnabled"`,
    );
  }
}
