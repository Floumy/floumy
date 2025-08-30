import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveDemoFromOrg1756563352527 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "org"
        DROP COLUMN "hadDemo"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "org"
            ADD COLUMN "hadDemo" boolean DEFAULT true
        `);
  }
}
