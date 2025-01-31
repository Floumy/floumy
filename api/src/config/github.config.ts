import { registerAs } from '@nestjs/config';

export default registerAs('github', () => ({
  clientId: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  redirectUri: process.env.GITHUB_REDIRECT_URI,
  webhookUrlBase: process.env.GITHUB_WEBHOOK_URL_BASE,
  webhookSecret: process.env.GITHUB_WEBHOOK_SECRET,
}));
