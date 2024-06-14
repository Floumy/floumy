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

  async createCustomer(name: string): Promise<{ id: string }> {
    const stripeCustomer = await this.stripe.customers.create({
      name,
    });

    return {
      id: stripeCustomer?.id,
    };
  }

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
    priceId: string,
    quantity: number,
  ): Promise<Stripe.Checkout.Session> {
    return this.stripe.checkout.sessions.create({
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

  constructWebhookEvent(requestBody: any, sig: any): Stripe.Event {
    return this.stripe.webhooks.constructEvent(
      requestBody,
      sig,
      this.configService.get('stripe.webhookSecret'),
    );
  }
}
