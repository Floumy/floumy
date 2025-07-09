import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAiEmbeddings1751398558492 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS vector`);

    // Create documents table
    await queryRunner.query(`
      CREATE TABLE documents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        content TEXT NOT NULL,
        metadata JSONB NOT NULL,
        embedding vector(1536),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indices
    await queryRunner.query(`
      CREATE INDEX ON documents USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
      CREATE INDEX idx_documents_metadata_user_id ON documents USING gin ((metadata->'userId'));
      CREATE INDEX idx_documents_metadata_project_id ON documents USING gin ((metadata->'project_id'));
      CREATE INDEX idx_documents_metadata_org_id ON documents USING gin ((metadata->'org_id'));
      CREATE INDEX idx_documents_metadata_document_type ON documents USING gin ((metadata->'documentType'));
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS documents`);
    await queryRunner.query(`DROP EXTENSION IF EXISTS vector`);
  }
}
