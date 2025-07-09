import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAiChatMessageHistory1751233070106
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE message_history (
                                       id SERIAL PRIMARY KEY,
                                       session_id TEXT,
                                       message JSONB,
                                       created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX idx_message_history_session_id ON message_history(session_id);
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE message_history`);
  }
}
