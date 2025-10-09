// src/services/document-vector-store.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PGVectorStore } from '@langchain/community/vectorstores/pgvector';
import { OpenAIEmbeddings } from '@langchain/openai';
import { Document } from '@langchain/core/documents';
import { DocumentMetadata } from './document-metadata.interface';

@Injectable()
export class DocumentVectorStoreService implements OnModuleInit {
  private vectorStore: PGVectorStore;
  private readonly embeddings: OpenAIEmbeddings;
  private readonly logger = new Logger(DocumentVectorStoreService.name);

  constructor(private configService: ConfigService) {
    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: this.configService.get('ai.apiKey'),
    });
  }

  async onModuleInit() {
    try {
      await this.initVectorStore();
    } catch (e) {
      this.logger.error(e);
    }
  }

  private async initVectorStore() {
    this.vectorStore = await PGVectorStore.initialize(this.embeddings, {
      postgresConnectionOptions: {
        host: this.configService.get('database.host'),
        port: this.configService.get('database.port'),
        user: this.configService.get('database.username'),
        password: this.configService.get('database.password'),
        database: this.configService.get('database.name'),
        ssl: this.configService.get('database.ssl')
          ? {
              rejectUnauthorized: true,
              ca: this.configService.get('database.sslCertificate'),
            }
          : false,
      },
      tableName: 'documents',
      columns: {
        idColumnName: 'id',
        vectorColumnName: 'embedding',
        contentColumnName: 'content',
        metadataColumnName: 'metadata',
      },
    });
  }

  async addDocument(
    content: string,
    metadata: DocumentMetadata,
  ): Promise<void> {
    const doc = new Document({
      pageContent: content,
      metadata: {
        ...metadata,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    await this.vectorStore.addDocuments([doc]);
  }

  async addDocuments(
    documents: Array<{ content: string; metadata: DocumentMetadata }>,
  ): Promise<void> {
    const docs = documents.map(
      (doc) =>
        new Document({
          pageContent: doc.content,
          metadata: {
            ...doc.metadata,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        }),
    );

    await this.vectorStore.addDocuments(docs);
  }

  async searchSimilarDocuments(
    query: string,
    userId: string,
    orgId: string,
    projectId: string,
    limit = 3,
  ) {
    return await this.vectorStore.similaritySearch(query, limit, {
      whereMetadata: {
        $and: [{ userId }, { orgId }, { projectId }],
      },
    });
  }

  async deleteDocument(documentId: string): Promise<void> {
    await this.vectorStore.delete({ ids: [documentId] });
  }

  async updateDocument(
    documentId: string,
    content: string,
    metadata: Partial<DocumentMetadata>,
  ): Promise<void> {
    await this.deleteDocument(documentId);
    await this.addDocument(content, {
      ...metadata,
      updatedAt: new Date(),
    } as DocumentMetadata);
  }

  /**
   * Get all documents by entity ID using direct metadata filtering
   * This is more efficient than similarity search when you only need to filter by metadata
   * @param entityId The entity ID to filter by
   * @returns Array of documents matching the entity ID
   */
  async getAllDocumentsByEntityId(entityId: string) {
    // Access the underlying PGVectorStore's client to perform a direct metadata query
    const client = this.vectorStore.client;

    // Use the tableName and columns configuration from the vectorStore
    const tableName = this.vectorStore.tableName;
    const columns = {
      idColumnName: this.vectorStore.idColumnName,
      contentColumnName: this.vectorStore.contentColumnName,
      metadataColumnName: this.vectorStore.metadataColumnName,
    };

    // Query documents directly by metadata
    const result = await client.query(
      `SELECT ${columns.idColumnName}, ${columns.contentColumnName}, ${columns.metadataColumnName}
       FROM ${tableName}
       WHERE ${columns.metadataColumnName} ->> 'entityId' = $1`,
      [entityId],
    );

    // Convert the query results to Document objects
    return result.rows.map((row) => {
      return new Document({
        pageContent: row[columns.contentColumnName],
        metadata: row[columns.metadataColumnName],
      });
    });
  }

  async deleteAllDocumentsByEntityId(entityId: string) {
    // Access the underlying PGVectorStore's client to perform a direct metadata query
    const client = this.vectorStore.client;

    // Use the tableName and columns configuration from the vectorStore
    const tableName = this.vectorStore.tableName;

    const metadataColumnName = this.vectorStore.metadataColumnName;

    // Delete documents directly by metadata
    await client.query(
      `DELETE FROM ${tableName}
       WHERE ${metadataColumnName} ->> 'entityId' = $1`,
      [entityId],
    );
  }
}
