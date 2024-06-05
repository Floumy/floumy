import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

const stripeClientProvider = {
  provide: 'STRIPE_CLIENT',
  useFactory: (configService: ConfigService) => {
    const stripeSecretKey = configService.get('stripe.secretKey');
    // This is a workaround to avoid creating the provider if the secret key is not set
    if (!stripeSecretKey) {
      return {
        customers: {
          create: async () => {
            console.error(
              'Stripe customer not created because the secret key is not set',
            );
          },
        },
        checkout: {
          sessions: {
            create: async () => {
              console.error(
                'Stripe checkout session not created because the secret key is not set',
              );
            },
          },
        },
        subscriptions: {
          list: async () => {
            console.error(
              'Stripe subscriptions not listed because the secret key is not set',
            );
          },
        },
      };
    }
    return new Stripe(stripeSecretKey);
  },
  inject: [ConfigService],
};

@Module({
  imports: [ConfigModule],
  providers: [StripeService, stripeClientProvider],
  exports: [StripeService],
})
export class StripeModule {}
