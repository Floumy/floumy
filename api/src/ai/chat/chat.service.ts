import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatOpenAI } from '@langchain/openai';
import {
  AIMessage,
  AIMessageChunk,
  HumanMessage,
  SystemMessage,
} from '@langchain/core/messages';
import { Observable } from 'rxjs';
import { PostgresChatMessageHistory } from '@langchain/community/stores/message/postgres';
import { DocumentVectorStoreService } from '../documents/document-vector-store.service';
import { formatDocumentsAsString } from 'langchain/util/document';
import { Repository } from 'typeorm';
import { WorkItem } from '../../backlog/work-items/work-item.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { Org } from '../../orgs/org.entity';

@Injectable()
export class ChatService {
  private readonly apiKey: string;

  constructor(
    private configService: ConfigService,
    private documentVectorStoreService: DocumentVectorStoreService,
    @InjectRepository(WorkItem)
    private workItemRepository: Repository<WorkItem>,
    @InjectRepository(Org)
    private orgRepository: Repository<Org>,
  ) {
    this.apiKey = this.configService.get('ai.apiKey');
  }

  private getMessageHistory(sessionId: string) {
    return new PostgresChatMessageHistory({
      sessionId: sessionId || 'default-session',
      poolConfig: {
        host: this.configService.get('database.host'),
        port: this.configService.get('database.port'),
        user: this.configService.get('database.username'),
        password: this.configService.get('database.password'),
        database: this.configService.get('database.name'),
        ssl: false,
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
  ): Observable<{
    id: string;
    type: 'message';
    data: any;
  }> {
    return new Observable((subscriber) => {
      const runStream = async () => {
        try {
          const model = new ChatOpenAI({
            model: 'gpt-4o',
            openAIApiKey: this.apiKey,
            temperature: 0.1,
          });

          const findOneWorkItem = tool(
            async ({ workItemReference }) => {
              if (!workItemReference) {
                return 'Please provide a work item reference';
              }

              const workItem = await this.workItemRepository.findOneBy({
                reference: workItemReference,
                org: {
                  id: orgId,
                },
              });

              return `
              Title: ${workItem.title}
              Description: ${workItem.description}
              Estimation: ${workItem.estimation}
              Priority: ${workItem.priority}
              Type: ${workItem.type}
              Status: ${workItem.status}
              Reference: ${workItem.reference}
              `;
            },
            {
              name: 'find-one-work-item',
              description:
                'Find a work item in the system based on its reference.',
              schema: z.object({
                workItemReference: z
                  .string()
                  .describe(
                    'The work item reference to search for in the form of WI-123',
                  ),
              }),
            },
          );

          const createWorkItem = tool(
            async ({ workItemTitle, workItemDescription }) => {
              if (!workItemTitle) {
                return 'Please provide a work item title';
              }

              if (!workItemDescription) {
                return 'Please provide a work item description';
              }
              const org = await this.orgRepository.findOneByOrFail({
                id: orgId,
              });
              const workItem = new WorkItem();
              workItem.title = workItemTitle;
              workItem.description = workItemDescription;
              workItem.org = Promise.resolve(org);
              await this.workItemRepository.save(workItem);
            },
            {
              name: 'create-work-item',
              description: 'Create a new work item in the system.',
              schema: z.object({
                workItemTitle: z.string().describe('The work item title.'),
                workItemDescription: z
                  .string()
                  .describe('The work item description.'),
              }),
            },
          );

          const agent = createReactAgent({
            llm: model,
            tools: [findOneWorkItem, createWorkItem],
          });

          let prompt = message;

          if (await this.shouldUseRag(message)) {
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
          }

          await this.getMessageHistory(sessionId).addMessage(
            new HumanMessage(prompt),
          );
          const historyMessages =
            await this.getMessageHistory(sessionId).getMessages();

          const systemMessage = new SystemMessage(
            `You are a helpful and concise project management assistant.
                  Respond only in markdown format.
                  Only ask follow-up questions when necessary to understand the request or provide a useful response.
                  If clarification is needed, ask a single, specific question.
                  Ignore unrelated topics.
                  
                  Example behavior:

                  If the user says:
                  
                  Help me define OKRs
                  
                  The assistant could reply:
                  
                  Sure. What’s the main goal or focus area you’re working on?
                  `,
          );

          const stream = await agent.stream(
            {
              messages: [
                systemMessage,
                ...historyMessages,
                new HumanMessage(message),
              ],
            },
            { streamMode: 'messages' },
          );

          let aiMessage = '';
          for await (const record of stream) {
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
          }

          await this.getMessageHistory(sessionId).addMessage(
            new AIMessage(aiMessage),
          );

          subscriber.complete();
        } catch (error) {
          subscriber.error(error);
        }
      };

      runStream();
    });
  }
}
