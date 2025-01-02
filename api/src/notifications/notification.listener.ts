import { OnEvent } from '@nestjs/event-emitter';
import { CreateNotificationDto } from './dtos';
import { NotificationService } from './notification.service';

export class NotificationListener {
  constructor(private readonly notificationsService: NotificationService) {}

  @OnEvent('mention.created')
  async handleCreateNotification(payload: CreateNotificationDto) {
    await this.notificationsService.createNotification(payload);
  }
}
