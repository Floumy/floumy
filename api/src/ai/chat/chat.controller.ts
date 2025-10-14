import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Query,
  Request,
  Sse,
  UseGuards,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { catchError, Observable } from 'rxjs';
import { uuid } from 'uuidv4';
import { AuthGuard } from '../../auth/auth.guard';
import { ChatHistoryService } from './chat-history.service';

@Controller('ai/chat')
@UseGuards(AuthGuard)
export class ChatController {
  private readonly logger = new Logger(ChatController.name);

  constructor(
    private readonly chatService: ChatService,
    private readonly chatHistoryService: ChatHistoryService,
  ) {}

  @Sse('stream/:sessionId')
  streamChat(
    @Request() request,
    @Param('sessionId') sessionId: string,
    @Query('message') message: string,
    @Query('project') project: string,
  ): Observable<{
    id: string;
    type: 'message';
    data: any;
  }> {
    const messageId = uuid();
    return this.chatService
      .sendMessageStream(
        request.user.sub,
        request.user.org,
        sessionId,
        messageId,
        message,
        project,
      )
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

  @Get('history/sessions/projects/:projectId/')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async getHistorySessions(
    @Param('projectId') projectId: string,
    @Request() request: any,
  ) {
    try {
      return await this.chatHistoryService.getHistorySessions(
        request.user.sub,
        projectId,
      );
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Get('history/sessions/:sessionId/messages')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async getHistorySessionMessages(
    @Param('sessionId') sessionId: string,
    @Request() request: any,
  ) {
    try {
      return await this.chatHistoryService.getHistorySessionMessages(
        request.user.sub,
        sessionId,
      );
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
