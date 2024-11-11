import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIssueStatusPriorityAndWorkItems1727030355419
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TYPE "issue_status_enum" AS ENUM(
                'submitted', 'acknowledged', 'under-review', 'in-progress', 
                'awaiting-customer-response', 'escalated', 'scheduled', 'testing', 
                'resolved', 'closed', 'reopened', 'on-hold', 'pending-third-party', 
                'planned-for-future-release', 'cannot-reproduce', 'not-a-bug', 'duplicate'
            )
        `);
    await queryRunner.query(`
            CREATE TYPE "issue_priority_enum" AS ENUM('low', 'medium', 'high')
        `);
    await queryRunner.query(`
        ALTER TABLE "issue"
            ADD COLUMN "status"   "issue_status_enum"   DEFAULT 'submitted'::"issue_status_enum" NOT NULL,
            ADD COLUMN "priority" "issue_priority_enum" DEFAULT 'medium'::"issue_priority_enum"  NOT NULL
    `);
    await queryRunner.query(`
        ALTER TABLE "work_item"
            ADD COLUMN "issueId" uuid
    `);
    await queryRunner.query(`
        ALTER TABLE "work_item"
            ADD CONSTRAINT "FK_WORK_ITEM_ISSUE_ID" FOREIGN KEY ("issueId") REFERENCES "issue" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "work_item"
            DROP CONSTRAINT "FK_WORK_ITEM_ISSUE_ID"
    `);
    await queryRunner.query(`
        ALTER TABLE "issue"
            DROP COLUMN "status",
            DROP COLUMN "priority"
    `);
    await queryRunner.query(`DROP TYPE "issue_status_enum"`);
    await queryRunner.query(`DROP TYPE "issue_priority_enum"`);
  }
}
