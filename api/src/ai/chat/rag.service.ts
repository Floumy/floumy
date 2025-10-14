import { Injectable } from '@nestjs/common';
import { formatDocumentsAsString } from 'langchain/util/document';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { DocumentVectorStoreService } from '../documents/document-vector-store.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RagService {
  private readonly apiKey: string;

  constructor(
    private documentVectorStoreService: DocumentVectorStoreService,
    private configService: ConfigService,
  ) {
    this.apiKey = this.configService.get('ai.apiKey');
  }

  async getMessageWithContext(
    message: string,
    userId: string,
    orgId: string,
    projectId: string,
  ) {
    if (await this.shouldUseRag(message)) {
      return this.getMessageWithRelevantDocsContext(
        message,
        userId,
        orgId,
        projectId,
      );
    }

    return message;
  }

  private async getMessageWithRelevantDocsContext(
    message: string,
    userId: string,
    orgId: string,
    projectId: string,
  ) {
    const relevantDocs =
      await this.documentVectorStoreService.searchSimilarDocuments(
        message,
        userId,
        orgId,
        projectId,
        3,
      );

    if (relevantDocs.length > 0) {
      const contextString = formatDocumentsAsString(relevantDocs);

      return `
              Context information is below.
              ---------------------
              ${contextString}
              ---------------------
              Given the context information and not prior knowledge, answer the question: ${message}
              Never mention or reference the context information in your answer.
            `;
    }

    return message;
  }

  private async shouldUseRag(message: string): Promise<boolean> {
    const classifier = new ChatOpenAI({
      model: 'gpt-3.5-turbo-0125',
      streaming: true,
      openAIApiKey: this.apiKey,
      temperature: 0.1,
    });

    const response = await classifier.invoke([
      new SystemMessage(`You are a query classifier that determines if a user's question requires accessing specific system data.
        Reply with either "true" or "false" only.
        
        Return "true" if the query is about:
        - Initiatives, tasks, or work items in the system
        - OKRs, objectives, or key results
        - Organization or team specific information
        - Sprints or backlog items
        - Any stored documents or internal data
        - Anything that happened in the past
        
        Return "false" if the query is about:
        - Any reference like O-123, KR-123, I-123, WI-123, etc. 
        - General questions
        - Generic concepts
        - Conversational exchanges
        - Technical support unrelated to system data`),
      new HumanMessage(message),
    ]);

    return response.text.toLowerCase().includes('true');
  }
}
