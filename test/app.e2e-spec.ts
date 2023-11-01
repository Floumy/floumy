import {Test, TestingModule} from "@nestjs/testing";
import {HttpStatus, INestApplication} from "@nestjs/common";
import * as request from "supertest";
import {AuthModule} from "../src/auth/auth.module";
import {UsersModule} from "../src/users/users.module";
import {AuthService} from "../src/auth/auth.service";
import {UsersService} from "../src/users/users.service";
import {Reflector} from "@nestjs/core";
import {AppController} from "../src/app.controller";
import {AppService} from "../src/app.service";
import {AuthController} from "../src/auth/auth.controller";
import {jwtModule} from "./jwt.test-module";
import {typeOrmModule} from './typeorm.test-module';
import {TypeOrmModule} from '@nestjs/typeorm';
import {User} from '../src/users/user.entity';
import {ConfigModule} from '@nestjs/config';
import databaseConfig from '../src/config/database.config';
import encryptionConfig from '../src/config/encryption.config';

describe("AppController (e2e)", () => {
    let app: INestApplication;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [
                jwtModule,
                typeOrmModule,
                TypeOrmModule.forFeature([User]),
                AuthModule,
                UsersModule,
                ConfigModule.forRoot({
                    load: [databaseConfig, encryptionConfig],
                })
            ],
            controllers: [AppController, AuthController],
            providers: [AppService, AuthService, UsersService, Reflector]
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    it("/ (GET)", () => {
        return request(app.getHttpServer())
            .get("/")
            .expect(HttpStatus.OK)
            .expect("Hello World!");
    });
});
