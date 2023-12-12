import { INestApplication } from "@nestjs/common";
import { setupTestingModule } from "./test.utils";
import { UsersModule } from "../src/users/users.module";
import { OrgsModule } from "../src/orgs/orgs.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../src/users/user.entity";
import { RefreshToken } from "../src/auth/refresh-token.entity";
import { Org } from "../src/orgs/org.entity";
import { Feature } from "../src/roadmap/features/feature.entity";
import { AuthService } from "../src/auth/auth.service";
import { UsersService } from "../src/users/users.service";
import { Reflector } from "@nestjs/core";
import { TokensService } from "../src/auth/tokens.service";
import { FeaturesService } from "../src/roadmap/features/features.service";
import { AuthController } from "../src/auth/auth.controller";
import { FeaturesController } from "../src/roadmap/features/features.controller";
import { signUpAndSignIn } from "./auth.service";
import { WorkItemsService } from "../src/backlog/work-items/work-items.service";
import { WorkItemsController } from "../src/backlog/work-items/work-items.controller";
import { WorkItem } from "../src/backlog/work-items/work-item.entity";
import * as request from "supertest";
import { BacklogModule } from "../src/backlog/backlog.module";
import { OkrsModule } from "../src/okrs/okrs.module";
import { OkrsService } from "../src/okrs/okrs.service";
import { MilestonesService } from "../src/roadmap/milestones/milestones.service";
import { Milestone } from "../src/roadmap/milestones/milestone.entity";
import { KeyResult } from "../src/okrs/key-result.entity";
import { Objective } from "../src/okrs/objective.entity";

describe("Backlog (e2e)", () => {
  let app: INestApplication;
  let accessToken: string;
  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [UsersModule, OrgsModule, BacklogModule, OkrsModule, TypeOrmModule.forFeature([User, RefreshToken, Org, Feature, Objective, KeyResult, WorkItem, Milestone])],
      [AuthService, UsersService, Reflector, TokensService, FeaturesService, WorkItemsService, OkrsService, MilestonesService],
      [AuthController, FeaturesController, WorkItemsController]
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

  describe("/work-items (POST)", () => {
    it("should create a work item", async () => {
      const createFeatureResponse = await request(app.getHttpServer())
        .post("/features")
        .send({
          title: "Feature 1",
          description: "Feature 1 description",
          priority: "high",
          timeline: "this-quarter"
        })
        .set("Authorization", `Bearer ${accessToken}`);
      const featureId = createFeatureResponse.body.id;
      const createWorkItemResponse = await request(app.getHttpServer())
        .post("/work-items")
        .send({
          title: "Work Item 1",
          description: "Work Item 1 description",
          priority: "high",
          feature: featureId
        })
        .set("Authorization", `Bearer ${accessToken}`);
      expect(createWorkItemResponse.statusCode).toEqual(201);
      expect(createWorkItemResponse.body.title).toEqual("Work Item 1");
      expect(createWorkItemResponse.body.description).toEqual("Work Item 1 description");
      expect(createWorkItemResponse.body.priority).toEqual("high");
      expect(createWorkItemResponse.body.feature.id).toEqual(featureId);
    });
  });
});
