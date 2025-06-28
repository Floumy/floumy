import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { Observable } from 'rxjs';

@Injectable()
export class ChatService {
  private readonly apiKey: string;
  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get('ai.apiKey');
  }

  public sendMessageStream(
    messageId: string,
    message: string,
  ): Observable<{
    id: string;
    type: 'human' | 'ai' | 'error';
    data: string;
  }> {
    return new Observable((subscriber) => {
      const runStream = async () => {
        try {
          const model = new ChatOpenAI({
            model: 'gpt-3.5-turbo',
            streaming: true,
          });

          const prompt = [
            new SystemMessage(
              'You are a helpful project management assistant in a startup. You need to output your response in markdown format.',
            ),
            new HumanMessage(message),
          ];

          for await (const chunk of await model.stream(prompt)) {
            subscriber.next({
              id: messageId,
              type: 'ai',
              data: chunk.text,
            });
          }

          subscriber.complete();
        } catch (error) {
          subscriber.error(error);
        }
      };

      runStream();
    });
  }
}
