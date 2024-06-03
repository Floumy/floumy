import { Controller, Get, Post, Request } from '@nestjs/common';
import { Public } from '../auth/public.guard';
import Stripe from 'stripe';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private paymentService: PaymentsService) {}

  @Public()
  @Post('/webhook')
  async webhook(@Request() req: any) {
    const sig = req.headers['stripe-signature'];

    let event: Stripe.Event;

    try {
      event = this.paymentService.constructEvent(sig, req.body);
    } catch (err) {
      return { error: `Webhook Error: ${err.message}` };
    }

    await this.paymentService.handleWebhook(event);

    return { received: true };
  }

  @Post('/checkout-session')
  async createCheckoutSession(@Request() req: any) {
    const { customerId, priceId } = req.body;

    const sessionUrl = await this.paymentService.createCheckoutSessionUrl(
      customerId,
      priceId,
    );

    return { url: sessionUrl };
  }

  @Get('/has-active-subscriptions')
  async hasActiveSubscription(@Request() req: any) {
    const { customerId } = req.body;

    const hasActiveSubscription =
      await this.paymentService.hasActiveSubscriptions(customerId);

    return { hasActiveSubscription };
  }
}
