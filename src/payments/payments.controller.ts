import { Controller, Get, Post, Request } from '@nestjs/common';
import { Public } from '../auth/public.guard';
import Stripe from 'stripe';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private paymentService: PaymentsService) {}

  @Public()
  @Post('/webhook')
  async webhook(@Request() request: any) {
    const sig = request.headers['stripe-signature'];

    let event: Stripe.Event;

    try {
      event = this.paymentService.constructEvent(sig, request.body);
    } catch (err) {
      return { error: `Webhook Error: ${err.message}` };
    }

    await this.paymentService.handleWebhook(event);

    return { received: true };
  }

  @Post('/checkout-session')
  async createCheckoutSession(@Request() request: any) {
    const org = request.user.org;

    const sessionUrl = await this.paymentService.createCheckoutSessionUrl(org);

    return { url: sessionUrl };
  }

  @Get('/has-active-subscriptions')
  async hasActiveSubscription(@Request() request: any) {
    const org = request.user.org;

    const hasActiveSubscription =
      await this.paymentService.hasActiveSubscriptions(org);

    return { hasActiveSubscription };
  }
}
