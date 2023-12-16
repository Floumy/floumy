import "dotenv/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { initializeTransactionalContext } from "typeorm-transactional";

async function bootstrap() {
  initializeTransactionalContext();
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(8080);
}

bootstrap();
