import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatOpenAI } from '@langchain/openai';
import { AIMessageChunk, HumanMessage, SystemMessage, } from '@langchain/core/messages';
import { Observable, Subscriber } from 'rxjs';
import { DocumentVectorStoreService } from '../documents/document-vector-store.service';
import { formatDocumentsAsString } from 'langchain/util/document';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { WorkItemsToolsService } from './tools/work-items-tools.service';
import { InitiativesToolsService } from './tools/initiatives-tools.service';
import { MilestonesToolsService } from './tools/milestones-tools.service';
import { OkrsToolsService } from './tools/okrs-tools.service';
import { SprintsToolsService } from './tools/sprints-tools.service';
import { ChatMessageHistoryService } from './chat-message-history.service';

@Injectable()
export class ChatService {
  private readonly apiKey: string;

  constructor(
    private configService: ConfigService,
    private documentVectorStoreService: DocumentVectorStoreService,
    private workItemsToolsService: WorkItemsToolsService,
    private initiativesToolsService: InitiativesToolsService,
    private milestonesToolsService: MilestonesToolsService,
    private okrsToolsService: OkrsToolsService,
    private sprintsToolsService: SprintsToolsService,
    private chatMessageHistory: ChatMessageHistoryService,
  ) {
    this.apiKey = this.configService.get('ai.apiKey');
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

  public sendMessageStream(
    userId: string,
    orgId: string,
    sessionId: string,
    messageId: string,
    message: string,
    projectId: string,
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
          const model = new ChatOpenAI({
            model: 'gpt-4o',
            openAIApiKey: this.apiKey,
            streaming: true,
            // callbacks: [new ConsoleCallbackHandler()],
          });
          const agent = createReactAgent({
            llm: model,
            tools: [
              ...this.workItemsToolsService.getTools(orgId, projectId, userId),
              ...this.initiativesToolsService.getTools(
                orgId,
                projectId,
                userId,
              ),
              ...this.milestonesToolsService.getTools(orgId, projectId),
              ...this.okrsToolsService.getTools(orgId, projectId, userId),
              ...this.sprintsToolsService.getTools(orgId, projectId),
            ],
          });

          await this.chatMessageHistory.addHumanMessage(sessionId, message);

          let prompt = message;
          if (await this.shouldUseRag(message)) {
            prompt = await this.getPromptWithRelevantContextDocs(
              message,
              userId,
              orgId,
              prompt,
            );
          }

          const systemMessage = new SystemMessage(
            `You are a helpful and concise project management assistant.
                  The current date is ${new Date().toISOString()}
                  Respond only in markdown format.
                  Only ask follow-up questions when necessary to understand the request or provide a useful response.
                  If clarification is needed, ask a single, specific question.
                  Ignore unrelated topics.
                  
                  Important policies: 
                  - You must obtain explicit human approval before creating or updating anything. First, propose the item details (title, type, description, etc.) and wait for the user's clear approval in natural language (e.g., “yes”, “looks good”, “go ahead”). Only after explicit approval should you call the confirm tool to create the item.
                  - When asked to update a specific entity get its details first and try to propose changes based on existing content
                  - When asked about the roadmap, use the milestones tools because the roadmap is a series of milestones
                  - When asked to create a roadmap, find existing milestones and propose new ones to associate with the initiatives provided
                  - When returning information about created or updated entities, always include the reference
                  
                  Example behavior:

                  If the user says:
                  
                  Help me define OKRs
                  
                  The assistant could reply:
                  
                  Sure. What’s the main goal or focus area you’re working on?
                  `,
          );

          const historyMessages =
            await this.chatMessageHistory.getMessages(sessionId);
          const stream = await agent.stream(
            {
              messages: [
                systemMessage,
                ...historyMessages,
                new HumanMessage(prompt),
              ],
            },
            { streamMode: 'messages' },
          );

          let aiMessage = '';
          for await (const record of stream) {
            const chunk = record[0];
            if (chunk instanceof AIMessageChunk) {
              aiMessage = this.sendNextChunkToTheSubscriber(
                chunk,
                subscriber,
                messageId,
                aiMessage,
              );
            }
          }

          await this.chatMessageHistory.addAiMessage(sessionId, aiMessage);

          subscriber.complete();
        } catch (error) {
          subscriber.error(error);
        } finally {
          clearTimeout(timeout);
        }
      };

      runStream();
    });
  }

  private sendNextChunkToTheSubscriber(
    chunk: AIMessageChunk,
    subscriber: Subscriber<{
      id: string;
      type: 'message';
      data: any;
    }>,
    messageId: string,
    aiMessage: string,
  ) {
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

    return aiMessage;
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
