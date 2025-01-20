import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  url: process.env.FRONTEND_URL,
}));
