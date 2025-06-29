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
    type: 'message';
    data: any;
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
              `You are a helpful project management conversational assistant.
              When you are asked to do something ask follow-up questions to gather more information if needed. Don't ask too many questions. 
              You need to output your response in markdown format.
              Do not respond to questions that are not related to the project.`,
            ),
            new HumanMessage(message),
          ];

          for await (const chunk of await model.stream(prompt)) {
            subscriber.next({
              id: new Date().toISOString(),
              type: 'message',
              data: {
                id: messageId,
                text: chunk.text,
                isUser: false,
              },
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
