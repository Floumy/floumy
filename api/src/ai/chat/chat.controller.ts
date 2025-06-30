import { Controller, Logger, Param, Query, Sse } from '@nestjs/common';
import { ChatService } from './chat.service';
import { catchError, Observable } from 'rxjs';
import { uuid } from 'uuidv4';

@Controller('ai/chat')
export class ChatController {
  private readonly logger = new Logger(ChatController.name);

  constructor(private readonly chatService: ChatService) {}

  @Sse('stream/:sessionId')
  streamChat(
    @Param('sessionId') sessionId: string,
    @Query('message') message: string,
  ): Observable<{
    id: string;
    type: 'message';
    data: any;
  }> {
    const messageId = uuid();
    return this.chatService
      .sendMessageStream(sessionId, messageId, message)
      .pipe(
        catchError((error) => {
          this.logger.error(error);
          return new Observable<{
            id: string;
            type: 'message';
            data: any;
          }>((subscriber) => {
            subscriber.next({
              data: {
                id: messageId,
                error: 'An error occurred during streaming',
                isUser: false,
              },
              type: 'message',
              id: new Date().toISOString(),
            });
            subscriber.complete();
          });
        }),
      );
  }
}
