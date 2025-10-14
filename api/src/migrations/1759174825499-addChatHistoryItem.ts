import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddChatHistoryItem1759174825499 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "chat_history"
      (
        "id"        uuid              NOT NULL DEFAULT uuid_generate_v4(),
        "title"     character varying NOT NULL,
        "sessionId" character varying NOT NULL,
        "createdAt" TIMESTAMP         NOT NULL DEFAULT now(),
        "userId"    uuid,
        "projectId" uuid,
        CONSTRAINT "PK_chat_history" PRIMARY KEY ("id"),
        CONSTRAINT "FK_user_chat_history" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE SET NULL,
        CONSTRAINT "FK_project_chat_history" FOREIGN KEY ("projectId") REFERENCES "project" ("id") ON DELETE SET NULL
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "chat_history"`);
  }
}
