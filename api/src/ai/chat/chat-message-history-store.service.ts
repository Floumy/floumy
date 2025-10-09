import { PostgresChatMessageHistory } from '@langchain/community/stores/message/postgres';
import { ConfigService } from '@nestjs/config';
import { AIMessage, HumanMessage } from '@langchain/core/messages';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ChatMessageHistoryStoreService {
  private readonly logger = new Logger(ChatMessageHistoryStoreService.name);

  constructor(private configService: ConfigService) {}

  private getHistory(sessionId: string) {
    return new PostgresChatMessageHistory({
      sessionId: sessionId,
      poolConfig: {
        host: this.configService.get('database.host'),
        port: this.configService.get('database.port'),
        user: this.configService.get('database.username'),
        password: this.configService.get('database.password'),
        database: this.configService.get('database.name'),
        ssl: this.configService.get('database.ssl')
          ? {
              rejectUnauthorized: true,
              ca: this.configService.get('database.sslCertificate'),
            }
          : false,
      },
      tableName: 'message_history',
    });
  }

  async addAiMessage(sessionId: string, aiMessage: string) {
    try {
      await this.getHistory(sessionId).addMessage(new AIMessage(aiMessage));
    } catch (e) {
      this.logger.error(e);
    }
  }

  async addHumanMessage(sessionId: string, message: string) {
    try {
      await this.getHistory(sessionId).addMessage(new HumanMessage(message));
    } catch (e) {
      this.logger.error(e);
    }
  }

  async getMessages(sessionId: string) {
    try {
      return await this.getHistory(sessionId).getMessages();
    } catch (e) {
      this.logger.error(e);
    }
  }
}
