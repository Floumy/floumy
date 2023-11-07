import { HttpStatus, INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { UsersService } from "../src/users/users.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../src/users/user.entity";
import { signUpAndSignIn } from "./auth.service";
import { UsersModule } from "../src/users/users.module";
import { AuthController } from "../src/auth/auth.controller";
import { AuthService } from "../src/auth/auth.service";
import { Reflector } from "@nestjs/core";
import { OkrsController } from "../src/okrs/okrs.controller";
import { setupTestingModule } from "./test.utils";
import { RefreshToken } from "../src/auth/refresh-token.entity";

describe("OKRsController (e2e)", () => {
  let app: INestApplication;
  let accessToken: string;
  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [UsersModule, TypeOrmModule.forFeature([User, RefreshToken])],
      [AuthService, UsersService, Reflector],
      [AuthController, OkrsController]
    );
    cleanup = dbCleanup;
    app = module.createNestApplication();
    await app.init();
    const signInResponse = await signUpAndSignIn(app, "John Doe", "john.doe@example.com", "testtesttest");
    accessToken = signInResponse.body.accessToken;
  });

  afterEach(async () => {
    await cleanup();
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
