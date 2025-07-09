import { registerAs } from '@nestjs/config';
import * as process from 'node:process';

export default registerAs('database', () => ({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  name: process.env.DB_DATABASE,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true',
  sslCertificate: process.env.DB_SSL_CERTIFICATE,
}));
