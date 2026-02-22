import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameWorkItemTypesToGeneric1760000000001
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "work_item_type_enum" RENAME TO "work_item_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "work_item_type_enum" AS ENUM('deliverable', 'task', 'defect', 'research', 'improvement')`,
    );
    await queryRunner.query(`
      ALTER TABLE "work_item"
        ALTER COLUMN "type" DROP DEFAULT,
        ALTER COLUMN "type" TYPE "work_item_type_enum" USING (
          CASE "type"::text
            WHEN 'user-story' THEN 'deliverable'::work_item_type_enum
            WHEN 'bug' THEN 'defect'::work_item_type_enum
            WHEN 'spike' THEN 'research'::work_item_type_enum
            WHEN 'technical-debt' THEN 'improvement'::work_item_type_enum
            ELSE 'task'::work_item_type_enum
          END
        ),
        ALTER COLUMN "type" SET DEFAULT 'deliverable'::work_item_type_enum
    `);
    await queryRunner.query(`DROP TYPE "work_item_type_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "work_item_type_enum" RENAME TO "work_item_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "work_item_type_enum" AS ENUM('user-story', 'task', 'bug', 'spike', 'technical-debt')`,
    );
    await queryRunner.query(`
      ALTER TABLE "work_item"
        ALTER COLUMN "type" DROP DEFAULT,
        ALTER COLUMN "type" TYPE "work_item_type_enum" USING (
          CASE "type"::text
            WHEN 'deliverable' THEN 'user-story'::work_item_type_enum
            WHEN 'defect' THEN 'bug'::work_item_type_enum
            WHEN 'research' THEN 'spike'::work_item_type_enum
            WHEN 'improvement' THEN 'technical-debt'::work_item_type_enum
            ELSE 'task'::work_item_type_enum
          END
        ),
        ALTER COLUMN "type" SET DEFAULT 'user-story'::work_item_type_enum
    `);
    await queryRunner.query(`DROP TYPE "work_item_type_enum_old"`);
  }
}
