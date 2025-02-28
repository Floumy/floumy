import { registerAs } from '@nestjs/config';

export default registerAs('gitlab', () => ({
  webhookUrlBase: process.env.GITLAB_WEBHOOK_URL_BASE,
  webhookSecret: process.env.GITLAB_WEBHOOK_SECRET,
}));
