import { Injectable } from '@nestjs/common';
import { AIMessageChunk, HumanMessage } from '@langchain/core/messages';
import { Observable, Subscriber } from 'rxjs';
import { AiAgentService } from './ai-agent.service';
import { RagService } from './rag.service';
import { ChatHistoryService } from './chat-history.service';

@Injectable()
export class ChatService {
  constructor(
    private chatHistoryService: ChatHistoryService,
    private aiAgentService: AiAgentService,
    private ragService: RagService,
  ) {}

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
          const prompt = await this.ragService.getMessageWithContext(
            message,
            userId,
            orgId,
            projectId,
          );

          const historyMessages =
            await this.chatHistoryService.getOrCreateChatHistory(
              message,
              sessionId,
              userId,
              projectId,
            );
          console.log(historyMessages);

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

          await this.chatHistoryService.addAiMessage(
            aiMessage,
            sessionId,
            userId,
            projectId,
          );

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
