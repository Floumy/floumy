import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRoleToUser1749755212947 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "user_role_enum" AS ENUM('admin', 'contributor')`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD COLUMN "role" "user_role_enum" NOT NULL DEFAULT 'admin'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "role"`);
    await queryRunner.query(`DROP TYPE "user_role_enum"`);
  }
}
