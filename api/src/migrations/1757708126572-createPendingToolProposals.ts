import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePendingToolProposals1757708126572
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "pending_tool_proposals" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "sessionId" TEXT NOT NULL,
        "orgId" uuid NOT NULL,
        "userId" uuid NOT NULL,
        "data" jsonb NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_pending_tool_proposals_id" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "pending_tool_proposals"`);
  }
}
