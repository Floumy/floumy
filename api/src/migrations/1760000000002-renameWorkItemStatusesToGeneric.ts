import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameWorkItemStatusesToGeneric1760000000002
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Rename work_item_status_enum values
    await queryRunner.query(
      `ALTER TYPE "work_item_status_enum" RENAME TO "work_item_status_enum_old"`,
    );
    await queryRunner.query(`
      CREATE TYPE "work_item_status_enum" AS ENUM(
        'planned', 'ready-to-start', 'in-progress', 'blocked',
        'review', 'testing', 'revisions', 'ready-to-ship', 'shipped',
        'done', 'closed'
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "work_item"
        ALTER COLUMN "status" DROP DEFAULT,
        ALTER COLUMN "status" TYPE "work_item_status_enum" USING (
          CASE "status"::text
            WHEN 'code-review' THEN 'review'::work_item_status_enum
            WHEN 'ready-for-deployment' THEN 'ready-to-ship'::work_item_status_enum
            WHEN 'deployed' THEN 'shipped'::work_item_status_enum
            ELSE "status"::text::work_item_status_enum
          END
        ),
        ALTER COLUMN "status" SET DEFAULT 'planned'::work_item_status_enum
    `);
    await queryRunner.query(`DROP TYPE "work_item_status_enum_old"`);

    // Rename work_items_status_stats columns
    await queryRunner.query(`
      ALTER TABLE "work_items_status_stats"
        RENAME COLUMN "codeReview" TO "review"
    `);
    await queryRunner.query(`
      ALTER TABLE "work_items_status_stats"
        RENAME COLUMN "readyForDeployment" TO "readyToShip"
    `);
    await queryRunner.query(`
      ALTER TABLE "work_items_status_stats"
        RENAME COLUMN "deployed" TO "shipped"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert work_items_status_stats columns
    await queryRunner.query(`
      ALTER TABLE "work_items_status_stats"
        RENAME COLUMN "shipped" TO "deployed"
    `);
    await queryRunner.query(`
      ALTER TABLE "work_items_status_stats"
        RENAME COLUMN "readyToShip" TO "readyForDeployment"
    `);
    await queryRunner.query(`
      ALTER TABLE "work_items_status_stats"
        RENAME COLUMN "review" TO "codeReview"
    `);

    // Revert work_item_status_enum
    await queryRunner.query(
      `ALTER TYPE "work_item_status_enum" RENAME TO "work_item_status_enum_old"`,
    );
    await queryRunner.query(`
      CREATE TYPE "work_item_status_enum" AS ENUM(
        'planned', 'ready-to-start', 'in-progress', 'blocked',
        'code-review', 'testing', 'revisions', 'ready-for-deployment', 'deployed',
        'done', 'closed'
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "work_item"
        ALTER COLUMN "status" DROP DEFAULT,
        ALTER COLUMN "status" TYPE "work_item_status_enum" USING (
          CASE "status"::text
            WHEN 'review' THEN 'code-review'::work_item_status_enum
            WHEN 'ready-to-ship' THEN 'ready-for-deployment'::work_item_status_enum
            WHEN 'shipped' THEN 'deployed'::work_item_status_enum
            ELSE "status"::text::work_item_status_enum
          END
        ),
        ALTER COLUMN "status" SET DEFAULT 'planned'::work_item_status_enum
    `);
    await queryRunner.query(`DROP TYPE "work_item_status_enum_old"`);
  }
}
