import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { AuthModule } from "../src/auth/auth.module";
import { UsersModule } from "../src/users/users.module";
import { JwtModule } from "@nestjs/jwt";
import { AuthService } from "../src/auth/auth.service";
import { UsersService } from "../src/users/users.service";
import { Reflector } from "@nestjs/core";
import { AppController } from "../src/app.controller";
import { AppService } from "../src/app.service";
import { AuthController } from "../src/auth/auth.controller";

describe("AppController (e2e)", () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AuthModule,
        UsersModule,
        JwtModule.register({
          global: true,
          secret: "secret",
          signOptions: { expiresIn: "60s" }
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
      .expect(200)
      .expect("Hello World!");
  });
});
