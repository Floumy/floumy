import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDemoToOrg1745609558143 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "org"
            ADD COLUMN "hadDemo" boolean DEFAULT true
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "org"
                DROP COLUMN "hadDemo"
        `);
  }
}
