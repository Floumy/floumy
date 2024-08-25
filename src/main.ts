import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn'],
    rawBody: true,
  });
  app.enableCors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  });
  app.useBodyParser('json', { limit: '300mb' });
  app.useBodyParser('urlencoded', { limit: '50mb', extended: true });
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(8080);
}

bootstrap();
