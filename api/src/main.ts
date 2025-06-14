import './instrument';

import 'dotenv/config';
import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {NestExpressApplication} from '@nestjs/platform-express';
import cookieParser from "cookie-parser";
import {ValidationPipe} from '@nestjs/common';
import * as process from "node:process";
import winston from "winston";
import {utilities as nestWinstonModuleUtilities, WinstonModule} from "nest-winston";

let transports = [];
if(process.env.NODE_ENV === 'production') {
    transports.push(new winston.transports.File({
        filename: '/usr/src/log/error.log',
        level: 'error',
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            winston.format.json(),
        ),
    }))
}else{
    transports.push(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            nestWinstonModuleUtilities.format.nestLike('Floumy', {
                colors: true,
                prettyPrint: true,
                processId: true,
                appName: true,
            }),
        ),
    }))
}
async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        logger: WinstonModule.createLogger({
            transports: transports
        }),
        rawBody: true,
    });
    app.enableCors({
        origin: process.env.FRONTEND_URL,
        credentials: true,
    });
    app.useBodyParser('json', {limit: '300mb'});
    app.useBodyParser('urlencoded', {limit: '50mb', extended: true});
    app.useGlobalPipes(new ValidationPipe());
    app.use(cookieParser());

    await app.listen(8080);
}

bootstrap();
