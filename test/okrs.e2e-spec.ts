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
import { Org } from "../src/orgs/org.entity";
import { OrgsModule } from "../src/orgs/orgs.module";
import { OkrsService } from "../src/okrs/okrs.service";
import { Objective } from "../src/okrs/objective.entity";

describe("OKRsController (e2e)", () => {
  let app: INestApplication;
  let accessToken: string;
  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [UsersModule, OrgsModule, TypeOrmModule.forFeature([User, RefreshToken, Org, Objective])],
      [AuthService, UsersService, Reflector, OkrsService],
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
          objective: {
            objective: "My OKR",
            description: "My OKR description"
          }
        })
        .expect(HttpStatus.CREATED)
        .expect(({ body }) => {
          expect(body.objective.id).toBeDefined();
          expect(body.objective.objective).toEqual("My OKR");
          expect(body.objective.description).toEqual("My OKR description");
        });
    });
  });
});
