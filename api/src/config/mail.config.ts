import { registerAs } from '@nestjs/config';

export default registerAs('mail', () => ({
  user: process.env.MAIL_USER,
  postmarkApiKey: process.env.POSTMARK_API_KEY,
  enabled:
    process.env.NODE_ENV === 'production'
      ? true
      : process.env.MAIL_ENABLED === 'true', // Use MAIL_ENABLED in non-prod
}));
