import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrgNameColumnToOrg1712406935707 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "org"
          ADD "name" varchar NOT NULL default ''`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "org"
        DROP COLUMN "name"`);
  }
}
