import { HttpStatus, INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { UsersModule } from "../src/users/users.module";
import { AuthService } from "../src/auth/auth.service";
import { UsersService } from "../src/users/users.service";
import { Reflector } from "@nestjs/core";
import { AuthController } from "../src/auth/auth.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { signUp, signUpAndSignIn } from "./auth.service";
import { User } from "../src/users/user.entity";
import { RefreshToken } from "../src/auth/refresh-token.entity";
import { setupTestingModule } from "./test.utils";
import { OrgsModule } from "../src/orgs/orgs.module";
import { OrgsService } from "../src/orgs/orgs.service";
import { Org } from "../src/orgs/org.entity";

describe("AuthController (e2e)", () => {
  let app: INestApplication;
  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [OrgsModule, UsersModule, TypeOrmModule.forFeature([User, RefreshToken, Org])],
      [AuthService, UsersService, Reflector, OrgsService],
      [AuthController]
    );

    cleanup = dbCleanup;
    app = module.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await cleanup();
  });

  it("/auth/profile (GET)", () => {
    return request(app.getHttpServer())
      .get("/auth/profile")
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it("/auth/profile (GET) with token", async () => {
    // Given an access token
    const signInResponse = await signUpAndSignIn(app, "John Doe", "john@example.com", "testtesttest");

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
    await signUp(app, "John Doe", "john@example.com", "testtesttest");
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

  it("/auth/refresh-token (POST) with valid refresh token", async () => {
    const signInResponse = await signUpAndSignIn(app, "John Doe", "john@example.com", "testtesttest");
    const refreshToken = signInResponse.body.refreshToken;
    return request(app.getHttpServer())
      .post("/auth/refresh-token")
      .send({
        refreshToken
      })
      .expect(HttpStatus.OK)
      .expect(({ body }) => {
        expect(body.accessToken).toBeDefined();
        expect(body.refreshToken).toBeDefined();
        expect(body.refreshToken).not.toEqual(refreshToken);
      });
  });
});
