import { registerAs } from '@nestjs/config';

export default registerAs('gitlab', () => ({
  clientId: process.env.GITLAB_CLIENT_ID,
  clientSecret: process.env.GITLAB_CLIENT_SECRET,
  redirectUri: process.env.GITLAB_REDIRECT_URI,
  webhookSecret: process.env.GITLAB_WEBHOOK_SECRET,
}));
