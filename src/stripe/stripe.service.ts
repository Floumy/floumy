import { Inject, Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { PaymentPlan } from '../auth/payment.plan';

@Injectable()
export class StripeService {
  constructor(
    @Inject('STRIPE_CLIENT') private stripe: Stripe,
    private configService: ConfigService,
  ) {}

  async createCustomer(email: string, name: string): Promise<Stripe.Customer> {
    return await this.stripe.customers.create({
      email,
      name,
    });
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
    customerId: string,
    priceId: string,
  ): Promise<Stripe.Checkout.Session> {
    return this.stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      subscription_data: {
        trial_period_days: 7,
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

  constructWebhookEvent(requestBody: any, sig: any) {
    return this.stripe.webhooks.constructEvent(
      requestBody,
      sig,
      this.configService.get('stripe.webhookSecret'),
    );
  }
}
