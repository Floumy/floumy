import { Test, TestingModule } from "@nestjs/testing";
import { HttpStatus, INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { UsersService } from "../src/users/users.service";
import { jwtModule } from "./jwt.test-module";
import { typeOrmModule } from "./typeorm.test-module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../src/users/user.entity";
import { ConfigModule } from "@nestjs/config";
import databaseConfig from "../src/config/database.config";
import encryptionConfig from "../src/config/encryption.config";
import { signUpAndSignIn } from "./auth.service";
import { OkrsModule } from "../src/okrs/okrs.module";
import { UsersModule } from "../src/users/users.module";
import { AuthController } from "../src/auth/auth.controller";
import { AuthModule } from "../src/auth/auth.module";
import { AuthService } from "../src/auth/auth.service";
import { Reflector } from "@nestjs/core";
import { OkrsController } from "../src/okrs/okrs.controller";

describe("AuthController (e2e)", () => {
  let app: INestApplication;
  let usersService: UsersService;
  let accessToken: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        jwtModule,
        typeOrmModule,
        TypeOrmModule.forFeature([User]),
        AuthModule,
        UsersModule,
        OkrsModule,
        ConfigModule.forRoot({
          load: [databaseConfig, encryptionConfig]
        })
      ],
      controllers: [AuthController, OkrsController],
      providers: [AuthService, UsersService, Reflector]
    }).compile();

    app = moduleFixture.createNestApplication();
    usersService = moduleFixture.get<UsersService>(UsersService);
    await app.init();
    const signInResponse = await signUpAndSignIn(app, "John Doe", "john.doe@example.com", "testtesttest");
    accessToken = signInResponse.body.accessToken;
  });

  afterEach(async () => {
    await usersService.clear();
  });

  describe("/okrs (POST)", () => {
    it("should return 201", async () => {
      return request(app.getHttpServer())
        .post("/okrs")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          title: "My OKR",
          description: "My OKR description"
        })
        .expect(HttpStatus.CREATED)
        .expect(({ body }) => {
          expect(body.id).toBeDefined();
          expect(body.title).toEqual("My OKR");
          expect(body.description).toEqual("My OKR description");
        });
    });
  });
});
