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
    limit = 3,
  ) {
    return await this.vectorStore.similaritySearch(query, limit, {
      whereMetadata: {
        $or: [{ userId }, { orgId }],
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
}
