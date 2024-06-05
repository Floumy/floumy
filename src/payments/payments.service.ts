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

      if (typeof session.subscription === 'object') {
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

  async createCheckoutSessionUrl(orgId: string): Promise<string> {
    const org = await this.orgsService.findOneById(orgId);
    const stripeSession = await this.stripeService.createCheckoutSession(
      org.stripeCustomerId,
      this.stripeService.getPriceIdByPaymentPlan(org.paymentPlan),
    );
    return stripeSession.url;
  }

  async getSubscriptionStatus(
    orgId: string,
  ): Promise<{ hasActiveSubscriptions: boolean; nextPaymentDate: Date }> {
    const org = await this.orgsService.findOneById(orgId);
    const activeSubscriptions =
      await this.stripeService.listActiveSubscriptions(org.stripeCustomerId);
    return {
      nextPaymentDate: org.nextPaymentDate,
      hasActiveSubscriptions: activeSubscriptions.length > 0,
    };
  }
}
