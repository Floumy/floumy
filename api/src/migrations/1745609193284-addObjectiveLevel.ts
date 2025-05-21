import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddObjectiveLevel1745609193284 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "objective_level_enum" AS ENUM ('ORGANIZATION', 'PROJECT')`,
    );
    await queryRunner.query(
      `ALTER TABLE "objective" ADD "level" "objective_level_enum" NOT NULL DEFAULT 'PROJECT'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "objective" DROP COLUMN "level"`);
    await queryRunner.query(`DROP TYPE "objective_level_enum"`);
  }
}
