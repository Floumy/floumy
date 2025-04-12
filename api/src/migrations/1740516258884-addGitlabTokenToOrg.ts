import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGitlabTokenToOrg1740516258884 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "org" ADD "gitlabToken" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "org" DROP COLUMN "gitlabToken"`);
  }
}
