import { Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { Public } from '../auth/public.guard';
import Stripe from 'stripe';
import { PaymentsService } from './payments.service';
import { AuthGuard } from '../auth/auth.guard';

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

  @UseGuards(AuthGuard)
  @Post('/checkout-session')
  async createCheckoutSession(@Request() request: any) {
    const org = request.user.org;
    return { url: await this.paymentService.createCheckoutSessionUrl(org) };
  }

  @UseGuards(AuthGuard)
  @Get('/subscriptions-details')
  async hasActiveSubscription(@Request() request: any) {
    const org = request.user.org;
    return await this.paymentService.getSubscriptionStatus(org);
  }
}
