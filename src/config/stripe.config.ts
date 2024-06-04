import { registerAs } from '@nestjs/config';

export default registerAs('stripe', () => ({
  secretKey: process.env.STRIPE_SECRET_KEY,
  successUrl: process.env.STRIPE_SUCCESS_URL,
  cancelUrl: process.env.STRIPE_CANCEL_URL,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  buildInPrivatePriceId: process.env.STRIPE_BUILD_IN_PRIVATE_PRICE_ID,
  buildInPublicPriceId: process.env.STRIPE_BUILD_IN_PUBLIC_PRICE_ID,
}));
