import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AIMessageChunk, HumanMessage } from '@langchain/core/messages';
import { Observable, Subscriber } from 'rxjs';
import { ChatMessageHistoryService } from './chat-message-history.service';
import { AiAgentService } from './ai-agent.service';
import { RagService } from './rag.service';

@Injectable()
export class ChatService {
  private readonly apiKey: string;

  constructor(
    private configService: ConfigService,
    private chatMessageHistory: ChatMessageHistoryService,
    private aiAgentService: AiAgentService,
    private ragService: RagService,
  ) {
    this.apiKey = this.configService.get('ai.apiKey');
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
          await this.chatMessageHistory.addHumanMessage(sessionId, message);

          const prompt = await this.ragService.getMessageWithContext(
            message,
            userId,
            orgId,
            projectId,
          );

          const historyMessages =
            await this.chatMessageHistory.getMessages(sessionId);

          const agent = this.aiAgentService.getChatAgent(
            orgId,
            projectId,
            userId,
          );
          const stream = await agent.stream(
            {
              messages: [...historyMessages, new HumanMessage(prompt)],
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
}
