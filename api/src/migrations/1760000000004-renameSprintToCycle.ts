import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameSprintToCycle1760000000004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "sprint_status_enum" RENAME TO "cycle_status_enum"`,
    );
    await queryRunner.query(`ALTER TABLE "sprint" RENAME TO "cycle"`);
    await queryRunner.query(`
      ALTER TABLE "work_item"
        RENAME COLUMN "sprintId" TO "cycleId"
    `);
    await queryRunner.query(`
      ALTER TABLE "bip_settings"
        RENAME COLUMN "isSprintsPagePublic" TO "isCyclesPagePublic"
    `);
    await queryRunner.query(`
      ALTER TABLE "bip_settings"
        RENAME COLUMN "isActiveSprintsPagePublic" TO "isActiveCyclesPagePublic"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "bip_settings"
        RENAME COLUMN "isActiveCyclesPagePublic" TO "isActiveSprintsPagePublic"
    `);
    await queryRunner.query(`
      ALTER TABLE "bip_settings"
        RENAME COLUMN "isCyclesPagePublic" TO "isSprintsPagePublic"
    `);
    await queryRunner.query(`
      ALTER TABLE "work_item"
        RENAME COLUMN "cycleId" TO "sprintId"
    `);
    await queryRunner.query(`ALTER TABLE "cycle" RENAME TO "sprint"`);
    await queryRunner.query(
      `ALTER TYPE "cycle_status_enum" RENAME TO "sprint_status_enum"`,
    );
  }
}
