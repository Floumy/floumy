import { Inject, Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { PaymentPlan } from '../auth/payment.plan';

@Injectable()
export class StripeService {
  constructor(
    @Inject('STRIPE_CLIENT') private readonly stripe: Stripe,
    private configService: ConfigService,
  ) {}

  getPriceIdByPaymentPlan(paymentPlan: PaymentPlan): string {
    switch (paymentPlan) {
      case PaymentPlan.BUILD_IN_PRIVATE:
        return this.configService.get('stripe.buildInPrivatePriceId');
      case PaymentPlan.BUILD_IN_PUBLIC:
        return this.configService.get('stripe.buildInPublicPriceId');
      default:
        throw new Error('Invalid payment plan');
    }
  }

  async createCheckoutSession(
    orgId: string,
    paymentPlan: PaymentPlan,
    priceId: string,
    quantity: number,
  ): Promise<Stripe.Checkout.Session> {
    return await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: quantity,
        },
      ],
      mode: 'subscription',
      metadata: {
        org: orgId,
        plan: paymentPlan,
      },
      success_url: this.configService.get('stripe.successUrl'),
      cancel_url: this.configService.get('stripe.cancelUrl'),
    });
  }

  async listActiveSubscriptions(
    customerId: string,
  ): Promise<Stripe.Subscription[]> {
    const subscriptions = await this.stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
    });
    return subscriptions.data;
  }

  constructWebhookEvent(requestBody: string, sig: string): Stripe.Event {
    return this.stripe.webhooks.constructEvent(
      requestBody,
      sig,
      this.configService.get('stripe.webhookSecret'),
    );
  }

  async cancelSubscription(stripeSubscriptionId: string) {
    await this.stripe.subscriptions.cancel(stripeSubscriptionId);
  }

  async updateSubscriptionPlan(
    subscriptionId: string,
    oldPaymentPlanPriceId: string,
    newPaymentPlanPriceId: string,
    quantity: number,
  ) {
    const oldSubscriptionItem = await this.getSubscriptionItem(
      subscriptionId,
      oldPaymentPlanPriceId,
    );

    await this.updateSubscriptionItem(
      subscriptionId,
      oldSubscriptionItem,
      newPaymentPlanPriceId,
      quantity,
    );
  }

  async updateSubscriptionQuantity(
    stripeSubscriptionId: string,
    paymentPlanPriceId: string,
    length: number,
  ) {
    const subscriptionItem = await this.getSubscriptionItem(
      stripeSubscriptionId,
      paymentPlanPriceId,
    );

    await this.updateSubscriptionItem(
      stripeSubscriptionId,
      subscriptionItem,
      paymentPlanPriceId,
      length,
    );
  }

  async getInvoice(invoiceId: string) {
    return await this.stripe.invoices.retrieve(invoiceId);
  }

  private async updateSubscriptionItem(
    subscriptionId: string,
    subscriptionItem: Stripe.SubscriptionItem,
    paymentPlanPriceId: string,
    quantity: number,
  ) {
    await this.stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: subscriptionItem.id,
          price: paymentPlanPriceId,
          quantity: quantity,
        },
      ],
    });
  }

  private async getSubscriptionItem(
    subscriptionId: string,
    paymentPlanPriceId: string,
  ) {
    const existingSubscriptionItems = await this.stripe.subscriptionItems.list({
      subscription: subscriptionId,
    });
    const oldSubscriptionItem = existingSubscriptionItems.data.find(
      (item) => item.price.id === paymentPlanPriceId,
    );
    if (!oldSubscriptionItem) {
      throw new Error('Subscription item not found');
    }
    return oldSubscriptionItem;
  }
}
