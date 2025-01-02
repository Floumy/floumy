import { Notification } from './notification.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { OnEvent } from '@nestjs/event-emitter';
import { CreateNotificationDto } from './dtos';

export class NotificationListener {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  @OnEvent('mention.created')
  async handleCreateNotification(payload: CreateNotificationDto) {
    const notifications: Notification[] = [];
    for (const mention of payload.mentions) {
      if (mention.id === payload.createdBy.id) {
        continue;
      }
      const alreadyExists = await this.notificationRepository.count({
        where: {
          entityId: payload.entityId,
          user: { id: mention.id },
        },
      });
      if (!alreadyExists) {
        const notification = new Notification();
        notification.entity = payload.entity;
        notification.createdBy = Promise.resolve(payload.createdBy);
        notification.action = payload.action;
        notification.status = payload.status;
        notification.entityId = payload.entityId;
        notification.user = Promise.resolve(mention);
        notification.project = Promise.resolve(payload.project);
        notification.org = Promise.resolve(payload.org);
        notifications.push(notification);
      }
    }

    return await this.notificationRepository.save(notifications);
  }
}
