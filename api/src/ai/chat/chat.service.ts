import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatOpenAI } from '@langchain/openai';
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
} from '@langchain/core/messages';
import { Observable } from 'rxjs';
import { PostgresChatMessageHistory } from '@langchain/community/stores/message/postgres';

@Injectable()
export class ChatService {
  private readonly apiKey: string;

  constructor(private configService: ConfigService) {
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

  public sendMessageStream(
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
            model: 'chatgpt-4o-latest',
            streaming: true,
            openAIApiKey: this.apiKey,
            temperature: 0.1,
          });

          await this.getMessageHistory(sessionId).addMessage(
            new HumanMessage(message),
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

          const stream = await model.stream([
            systemMessage,
            ...historyMessages,
            new HumanMessage(message),
          ]);

          let aiMessage = '';
          for await (const chunk of stream) {
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
