import { Inject, Injectable } from '@nestjs/common';
import { StripeService } from '../stripe/stripe.service';
import Stripe from 'stripe';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { Org } from '../orgs/org.entity';
import { Repository } from 'typeorm';
import { PaymentPlan } from '../auth/payment.plan';

@Injectable()
export class PaymentsService {
  private static ONE_DAY_IN_MILLISECONDS = 86400000;

  constructor(
    private stripeService: StripeService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectRepository(Org) private orgRepository: Repository<Org>,
  ) {}

  async handleWebhook(event: any) {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      // One month from now
      const nextPaymentDate = new Date();
      nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);

      await this.saveSubscriptionDetailsForOrg(
        session.metadata.org,
        session.metadata.plan,
        session.customer as string,
        session.subscription as string,
        true,
        nextPaymentDate,
      );
    }

    // TODO: Handle other events
    // if (event.type === 'invoice.payment_succeeded') {
    //   const invoice = event.data.object as Stripe.Invoice;
    //   const customerId = invoice.customer as string;
    //
    //   await this.saveStripeSubscription(
    //     customerId,
    //     true,
    //     invoice.next_payment_attempt * 1000,
    //   );
    // }
    //
    // if (event.type === 'invoice.payment_failed') {
    //   const invoice = event.data.object as Stripe.Invoice;
    //   const customerId = invoice.customer as string;
    //
    //   await this.saveStripeSubscription(
    //     customerId,
    //     false,
    //     invoice.next_payment_attempt * 1000,
    //   );
    // }
  }

  constructEvent(sig: string, requestBody: string) {
    return this.stripeService.constructWebhookEvent(requestBody, sig);
  }

  async createCheckoutSessionUrl(
    orgId: string,
    paymentPlan: PaymentPlan,
  ): Promise<string> {
    const org = await this.orgRepository.findOneByOrFail({ id: orgId });
    const users = await org.users;
    const usersCount = users.filter((user) => user.isActive).length;
    const stripeSession = await this.stripeService.createCheckoutSession(
      org.id,
      paymentPlan,
      this.stripeService.getPriceIdByPaymentPlan(paymentPlan),
      usersCount,
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

    const org = await this.orgRepository.findOneByOrFail({ id: orgId });
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

  async saveSubscriptionDetailsForOrg(
    orgId: string,
    plan: string,
    stripeCustomerId: string,
    stripeSubscriptionId: string,
    isSubscribed: boolean,
    nextPaymentDate: Date,
  ) {
    const org = await this.orgRepository.findOneByOrFail({ id: orgId });
    org.paymentPlan = plan as PaymentPlan;
    org.isSubscribed = isSubscribed;
    org.stripeCustomerId = stripeCustomerId;
    org.stripeSubscriptionId = stripeSubscriptionId;
    org.nextPaymentDate = nextPaymentDate;
    await this.orgRepository.save(org);
  }
}
