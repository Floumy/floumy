import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFeatureCompletedAtColumn1736016953822
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "feature"
            ADD COLUMN "completedAt" TIMESTAMP DEFAULT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "feature"
            DROP COLUMN "completedAt";
    `);
  }
}
