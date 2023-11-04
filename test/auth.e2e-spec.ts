import { Test, TestingModule } from "@nestjs/testing";
import { HttpStatus, INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { AuthModule } from "../src/auth/auth.module";
import { UsersModule } from "../src/users/users.module";
import { AuthService } from "../src/auth/auth.service";
import { UsersService } from "../src/users/users.service";
import { Reflector } from "@nestjs/core";
import { AuthController } from "../src/auth/auth.controller";
import { jwtModule } from "./jwt.test-module";
import { typeOrmModule } from "./typeorm.test-module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../src/users/user.entity";
import { ConfigModule } from "@nestjs/config";
import databaseConfig from "../src/config/database.config";
import encryptionConfig from "../src/config/encryption.config";

describe("AuthController (e2e)", () => {
  let app: INestApplication;
  let usersService: UsersService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        jwtModule,
        typeOrmModule,
        TypeOrmModule.forFeature([User]),
        AuthModule,
        UsersModule,
        ConfigModule.forRoot({
          load: [databaseConfig, encryptionConfig]
        })
      ],
      controllers: [AuthController],
      providers: [AuthService, UsersService, Reflector]
    }).compile();

    app = moduleFixture.createNestApplication();
    usersService = moduleFixture.get<UsersService>(UsersService);
    await app.init();
  });

  afterEach(async () => {
    await usersService.clear();
  });

  async function signIn(): Promise<request.Test> {
    await singUp("John Doe", "john@example.com", "testtesttest");
    return request(app.getHttpServer())
      .post("/auth/sign-in")
      .send({
        name: "John Doe",
        email: "john@example.com",
        password: "testtesttest"
      })
      .expect(HttpStatus.OK)
      .expect(({ body }) => {
        expect(body.accessToken).toBeDefined();
      });
  }

  async function singUp(name: string, email: string, password: string): Promise<request.Test> {
    return request(app.getHttpServer())
      .post("/auth/sign-up")
      .send({
        name,
        email,
        password
      })
      .expect(HttpStatus.CREATED)
      .expect(({ body }) => {
        expect(body.accessToken).toBeDefined();
      });
  }

  it("/auth/profile (GET)", () => {
    return request(app.getHttpServer())
      .get("/auth/profile")
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it("/auth/profile (GET) with token", async () => {
    // Given an access token
    const signInResponse = await signIn();

    return request(app.getHttpServer())
      .get("/auth/profile")
      .set("Authorization", `Bearer ${signInResponse.body.accessToken}`)
      .expect(HttpStatus.OK)
      .expect(({ body }) => {
        expect(body.email).toBe("john@example.com");
      });
  });

  it("/auth/profile (GET) with invalid token", async () => {
    return request(app.getHttpServer())
      .get("/auth/profile")
      .set("Authorization", `Bearer invalid`)
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it("/auth/sign-in (POST)", async () => {
    await singUp("John Doe", "john@example.com", "testtesttest");
    return request(app.getHttpServer())
      .post("/auth/sign-in")
      .send({
        email: "john@example.com",
        password: "testtesttest"
      })
      .expect(HttpStatus.OK)
      .expect(({ body }) => {
        expect(body.accessToken).toBeDefined();
      });
  });

  it("/auth/sign-up (POST)", () => {
    return request(app.getHttpServer())
      .post("/auth/sign-up")
      .send({
        name: "John Doe",
        email: "john@example.com",
        password: "testtesttest"
      })
      .expect(HttpStatus.CREATED)
      .expect(({ body }) => {
        expect(body.accessToken).toBeDefined();
      });
  });

  it("/auth/sign-up (POST) with invalid credentials", () => {
    return request(app.getHttpServer())
      .post("/auth/sign-up")
      .send({
        name: "",
        email: "",
        password: ""
      })
      .expect(HttpStatus.BAD_REQUEST);
  });
});
