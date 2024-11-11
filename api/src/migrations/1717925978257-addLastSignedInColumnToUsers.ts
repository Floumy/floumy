import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLastSignedInColumnToUsers1717925978257
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user"
          ADD "lastSignedIn" TIMESTAMP`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user"
          DROP COLUMN "lastSignedIn"`,
    );
  }
}
