import "dotenv/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import * as bodyParser from "body-parser";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ["error", "warn"]
  });
  app.enableCors({
    origin: process.env.FRONTEND_URL,
    credentials: true
  });
  app.use(bodyParser.json({ limit: "50mb" }));
  app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
  await app.listen(8080);
}

bootstrap();
