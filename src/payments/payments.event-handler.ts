import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PaymentsService } from './payments.service';
import { User } from '../users/user.entity';

@Injectable()
export class PaymentsEventHandler {
  constructor(private paymentsService: PaymentsService) {}

  @OnEvent('user.activated')
  async handleStripeWebhookEvent(user: User) {
    const org = await user.org;
    await this.paymentsService.updateSubscriptionCount(org.id);
  }

  @OnEvent('user.deactivated')
  async handleUserDeactivated(user: User) {
    const org = await user.org;
    await this.paymentsService.updateSubscriptionCount(org.id);
  }
}
