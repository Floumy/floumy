import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNullableProjectForObjectives1747167597994
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "objective" ALTER COLUMN "projectId" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "objective" ALTER COLUMN "projectId" SET NOT NULL`,
    );
  }
}
