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
import { setupTestingModule } from "./test.utils";
import { RefreshToken } from "../src/auth/refresh-token.entity";
import { Org } from "../src/orgs/org.entity";
import { OrgsModule } from "../src/orgs/orgs.module";
import { OkrsService } from "../src/okrs/okrs.service";
import { TokensService } from "../src/auth/tokens.service";
import { KeyResult } from "../src/okrs/key-result.entity";
import { FeaturesService } from "../src/roadmap/features/features.service";
import { FeaturesController } from "../src/roadmap/features/features.controller";
import { Feature } from "../src/roadmap/features/feature.entity";
import { OkrsController } from "../src/okrs/okrs.controller";
import { Objective } from "../src/okrs/objective.entity";

describe("FeaturesController (e2e)", () => {
  let app: INestApplication;
  let accessToken: string;
  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [UsersModule, OrgsModule, TypeOrmModule.forFeature([User, RefreshToken, Org, Objective, KeyResult, Feature])],
      [AuthService, UsersService, Reflector, OkrsService, TokensService, FeaturesService],
      [AuthController, FeaturesController, OkrsController]
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

  describe("/features (POST)", () => {
    it("should return 201", async () => {
      const okrResponse = await request(app.getHttpServer())
        .post("/okrs")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          objective: {
            title: "My OKR"
          },
          keyResults: [
            { title: "My Key Result 1" },
            { title: "My Key Result 2" }
          ]
        })
        .expect(HttpStatus.CREATED);
      return request(app.getHttpServer())
        .post("/features")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          title: "my feature",
          description: "my feature description",
          priority: "medium",
          timeline: "this-quarter",
          keyResult: okrResponse.body.keyResults[0].id
        })
        .expect(HttpStatus.CREATED)
        .expect(({ body }) => {
          expect(body.id).toBeDefined();
          expect(body.title).toEqual("my feature");
          expect(body.description).toEqual("my feature description");
          expect(body.priority).toEqual("medium");
          expect(body.timeline).toEqual("this-quarter");
          expect(body.keyResult.id).toEqual(okrResponse.body.keyResults[0].id);
          expect(body.keyResult.title).toEqual("My Key Result 1");
        });
    });
  });
});
