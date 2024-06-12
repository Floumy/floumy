import { Inject, Injectable } from '@nestjs/common';
import { OrgsService } from '../orgs/orgs.service';
import { StripeService } from '../stripe/stripe.service';
import Stripe from 'stripe';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class PaymentsService {
  private static ONE_DAY_IN_MILLISECONDS = 86400000;

  constructor(
    private orgsService: OrgsService,
    private stripeService: StripeService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
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
    const cacheKey = `payment-check-${orgId}`;
    const cachedResult = await this.cacheManager.get<{
      hasActiveSubscriptions: boolean;
      nextPaymentDate: Date;
    }>(cacheKey);

    if (cachedResult !== undefined) {
      return cachedResult;
    }

    const org = await this.orgsService.findOneById(orgId);
    const activeSubscriptions = org.stripeCustomerId
      ? await this.stripeService.listActiveSubscriptions(org.stripeCustomerId)
      : [];

    const subscriptionStatus = {
      nextPaymentDate: org.nextPaymentDate,
      hasActiveSubscriptions: activeSubscriptions.length > 0,
    };

    await this.cacheManager.set(
      cacheKey,
      subscriptionStatus,
      PaymentsService.ONE_DAY_IN_MILLISECONDS,
    );

    return subscriptionStatus;
  }

  async hasActiveSubscription(orgId: string) {
    const { hasActiveSubscriptions } = await this.getSubscriptionStatus(orgId);
    return hasActiveSubscriptions;
  }
}
