import { Injectable } from '@nestjs/common';
import { OrgsService } from '../orgs/orgs.service';
import { StripeService } from '../stripe/stripe.service';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  constructor(
    private orgsService: OrgsService,
    private stripeService: StripeService,
  ) {}

  async handleWebhook(event: any) {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerId = session.customer as string;

      if (typeof session.subscription !== 'string') {
        await this.orgsService.saveStripeSubscription(
          customerId,
          true,
          session.subscription.current_period_end * 1000,
        );
      }
    }

    if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;

      await this.orgsService.saveStripeSubscription(
        customerId,
        true,
        invoice.next_payment_attempt * 1000,
      );
    }

    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;

      await this.orgsService.saveStripeSubscription(
        customerId,
        false,
        invoice.next_payment_attempt * 1000,
      );
    }
  }

  constructEvent(sig: any, requestBody: any) {
    return this.stripeService.constructWebhookEvent(requestBody, sig);
  }

  async createCheckoutSessionUrl(
    customerId: string,
    priceId: string,
  ): Promise<string> {
    const stripeCustomerId =
      await this.orgsService.getStripeCustomerId(customerId);
    const stripeSession = await this.stripeService.createCheckoutSession(
      stripeCustomerId,
      priceId,
    );
    return stripeSession.url;
  }

  async createCustomer(email: string, name: string): Promise<string> {
    const stripeCustomer = await this.stripeService.createCustomer(email, name);
    return stripeCustomer.id;
  }

  async hasActiveSubscriptions(customerId: string): Promise<boolean> {
    const stripeCustomerId =
      await this.orgsService.getStripeCustomerId(customerId);
    const activeSubscriptions =
      await this.stripeService.listActiveSubscriptions(stripeCustomerId);
    return activeSubscriptions.length > 0;
  }
}
