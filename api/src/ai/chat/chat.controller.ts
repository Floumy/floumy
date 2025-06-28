import { Controller, Logger, Query, Sse } from '@nestjs/common';
import { ChatService } from './chat.service';
import { catchError, Observable } from 'rxjs';
import { uuid } from 'uuidv4';

@Controller('ai/chat')
export class ChatController {
  private readonly logger = new Logger(ChatController.name);

  constructor(private readonly chatService: ChatService) {}

  @Sse('stream')
  streamChat(@Query('message') message: string): Observable<{
    id: string;
    type: 'human' | 'ai' | 'error';
    data: string;
  }> {
    const messageId = uuid();
    return this.chatService.sendMessageStream(messageId, message).pipe(
      catchError((error) => {
        this.logger.error(error);
        return new Observable<{
          id: string;
          type: 'human' | 'ai' | 'error';
          data: string;
        }>((subscriber) => {
          subscriber.next({
            data: 'An error occurred during streaming',
            type: 'error',
            id: messageId,
          });
          subscriber.complete();
        });
      }),
    );
  }
}
