import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatHistory } from './chat-history.entity';
import { Repository } from 'typeorm';
import { ChatMessageHistoryStoreService } from './chat-message-history-store.service';
import { User } from '../../users/user.entity';
import { Project } from '../../projects/project.entity';
import { AIMessage, HumanMessage } from '@langchain/core/messages';

@Injectable()
export class ChatHistoryService {
  constructor(
    @InjectRepository(ChatHistory)
    private readonly chatHistoryRepository: Repository<ChatHistory>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    private readonly chatMessageHistoryStoreServiceService: ChatMessageHistoryStoreService,
  ) {}

  async getOrCreateChatHistory(
    message: string,
    sessionId: string,
    userId: string,
    projectId: string,
  ) {
    const chatHistory = await this.chatHistoryRepository.findOneBy({
      sessionId,
      user: {
        id: userId,
      },
      project: {
        id: projectId,
      },
    });

    if (!chatHistory) {
      await this.createChatHistory(message, sessionId, userId, projectId);
    }

    await this.addHumanMessage(message, sessionId, userId, projectId);
    return await this.chatMessageHistoryStoreServiceService.getMessages(
      sessionId,
    );
  }

  async getChatHistoryByUserAndProject(userId: string, projectId: string) {
    const chatHistoryItems = await this.chatHistoryRepository.findBy({
      user: { id: userId },
      project: { id: projectId },
    });

    return await Promise.all(
      chatHistoryItems.map(async (chatHistory) => {
        return {
          sessionId: chatHistory.sessionId,
          title: chatHistory.title,
          createdAt: chatHistory.createdAt,
          messages: (
            await this.chatMessageHistoryStoreServiceService.getMessages(
              chatHistory.sessionId,
            )
          ).map(
            (historyMessage: AIMessage | HumanMessage) =>
              historyMessage?.content,
          ),
        };
      }),
    );
  }

  async addHumanMessage(
    message: string,
    sessionId: string,
    userId: string,
    projectId: string,
  ) {
    await this.validateChatHistoryExists(sessionId, userId, projectId);

    await this.chatMessageHistoryStoreServiceService.addHumanMessage(
      sessionId,
      message,
    );
  }

  private async validateChatHistoryExists(
    sessionId: string,
    userId: string,
    projectId: string,
  ) {
    await this.chatHistoryRepository.findOneByOrFail({
      sessionId,
      user: {
        id: userId,
      },
      project: {
        id: projectId,
      },
    });
  }

  async addAiMessage(
    message: string,
    sessionId: string,
    userId: string,
    projectId: string,
  ) {
    await this.validateChatHistoryExists(sessionId, userId, projectId);

    await this.chatMessageHistoryStoreServiceService.addAiMessage(
      sessionId,
      message,
    );
  }

  private async createChatHistory(
    message: string,
    sessionId: string,
    userId: string,
    projectId: string,
  ) {
    const user = await this.usersRepository.findOneByOrFail({
      id: userId,
    });
    const userOrg = await user.org;
    const project = await this.projectRepository.findOneByOrFail({
      id: projectId,
      org: {
        id: userOrg.id,
      },
    });
    const chatHistory = new ChatHistory();
    chatHistory.sessionId = sessionId;
    chatHistory.user = Promise.resolve(user);
    chatHistory.project = Promise.resolve(project);
    chatHistory.title = message.slice(0, 200);
    return this.chatHistoryRepository.save(chatHistory);
  }
}
