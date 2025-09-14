import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatOpenAI } from '@langchain/openai';
import {
  AIMessage,
  AIMessageChunk,
  HumanMessage,
  SystemMessage,
} from '@langchain/core/messages';
import { Observable, Subscriber } from 'rxjs';
import { PostgresChatMessageHistory } from '@langchain/community/stores/message/postgres';
import { DocumentVectorStoreService } from '../documents/document-vector-store.service';
import { formatDocumentsAsString } from 'langchain/util/document';
import { AgentService } from './agent.service';

@Injectable()
export class ChatService {
  private readonly apiKey: string;
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private configService: ConfigService,
    private documentVectorStoreService: DocumentVectorStoreService,
    private agentService: AgentService,
  ) {
    this.apiKey = this.configService.get('ai.apiKey');
  }

  private getMessageHistory(sessionId: string) {
    return new PostgresChatMessageHistory({
      sessionId: sessionId,
      poolConfig: {
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
      tableName: 'message_history',
    });
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
        - Specific projects, tasks, or work items in the system
        - OKRs, objectives, or key results
        - Organization or team specific information
        - Sprints or backlog items
        - Any stored documents or internal data
        - Anything that happened in the past
        - Any reference like O-123, KR-123, I-123, WI-123, etc. 
        
        Return "false" if the query is about:
        - General questions
        - Generic concepts
        - Conversational exchanges
        - Technical support unrelated to system data`),
      new HumanMessage(message),
    ]);

    return response.text.toLowerCase().includes('true');
  }

  public sendMessageStream(
    userId: string,
    orgId: string,
    sessionId: string,
    messageId: string,
    message: string,
    projectId?: string,
  ): Observable<{
    id: string;
    type: 'message';
    data: any;
  }> {
    return new Observable((subscriber) => {
      const timeout = setTimeout(() => {
        subscriber.error(new Error('Stream timeout'));
        subscriber.complete();
      }, 30000);

      const runStream = async () => {
        try {
          // Keep RAG and history behavior the same
          let prompt = message;

          if (await this.shouldUseRag(message)) {
            prompt = await this.getPromptWithRelevantContextDocs(
              message,
              userId,
              orgId,
              prompt,
            );
          }

          const historyMessages = await this.addCurrentPromptToHistory(
            sessionId,
            prompt,
          );

          // Build and stream from the multi-agent graph via AgentService
          const graph = await this.agentService.buildMultiAgentGraph(
            orgId,
            projectId ?? '',
            userId,
          );

          let aiMessage = '';
          const stream$ = this.agentService.streamMultiAgentAsObservable(
            graph,
            message, // keep using the original user message for userInput
            historyMessages ?? [],
            { modelId: 'gpt-4o' },
          );

          const subscription = stream$.subscribe({
            next: (evt) => {
              const textDelta = evt.data.textDelta ?? '';
              subscriber.next({
                id: new Date().toISOString(),
                type: 'message',
                data: {
                  id: messageId,
                  text: textDelta,
                  isUser: false,
                },
              });
              aiMessage += textDelta;
            },
            error: (error) => {
              subscriber.error(error);
              clearTimeout(timeout);
            },
            complete: async () => {
              try {
                await this.addAiMessageToHistory(sessionId, aiMessage);
              } catch (e) {
                this.logger.error(e);
              } finally {
                subscriber.complete();
                clearTimeout(timeout);
              }
            },
          });

          // Teardown for Observable
          return () => {
            subscription.unsubscribe();
            clearTimeout(timeout);
          };
        } catch (error) {
          subscriber.error(error);
          clearTimeout(timeout);
        }
      };

      runStream();
    });
  }

  private async addAiMessageToHistory(sessionId: string, aiMessage: string) {
    try {
      await this.getMessageHistory(sessionId).addMessage(
        new AIMessage(aiMessage),
      );
    } catch (e) {
      this.logger.error(e);
    }
  }

  private sendNextChunkToTheSubscriber(
    record: any,
    subscriber: Subscriber<{
      id: string;
      type: 'message';
      data: any;
    }>,
    messageId: string,
    aiMessage: string,
  ) {
    const chunk = record[0];
    if (chunk instanceof AIMessageChunk) {
      subscriber.next({
        id: new Date().toISOString(),
        type: 'message',
        data: {
          id: messageId,
          text: chunk.content,
          isUser: false,
        },
      });
      aiMessage += chunk.text;
    }
    return aiMessage;
  }

  private async addCurrentPromptToHistory(sessionId: string, prompt: string) {
    try {
      await this.getMessageHistory(sessionId).addMessage(
        new HumanMessage(prompt),
      );
      return await this.getMessageHistory(sessionId).getMessages();
    } catch (e) {
      this.logger.error(e);
    }
  }

  private async getPromptWithRelevantContextDocs(
    message: string,
    userId: string,
    orgId: string,
    prompt: string,
  ) {
    const relevantDocs =
      await this.documentVectorStoreService.searchSimilarDocuments(
        message,
        userId,
        orgId,
        3,
      );

    if (relevantDocs.length > 0) {
      const contextString = formatDocumentsAsString(relevantDocs);

      prompt = `
              Context information is below.
              ---------------------
              ${contextString}
              ---------------------
              Given the context information and not prior knowledge, answer the question: ${message}
              Never mention or reference the context information in your answer.
            `;
    }
    return prompt;
  }
}
