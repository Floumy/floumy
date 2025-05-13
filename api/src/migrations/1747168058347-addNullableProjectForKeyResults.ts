import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNullableProjectForKeyResults1747168058347
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "key_result"
          ALTER COLUMN "projectId" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "key_result"
          ALTER COLUMN "projectId" SET NOT NULL`,
    );
  }
}
