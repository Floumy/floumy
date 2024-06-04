import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

const stripeClientProvider = {
  provide: 'STRIPE_CLIENT',
  useFactory: (configService: ConfigService) => {
    const stripeSecretKey = configService.get('stripe.secretKey');
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
