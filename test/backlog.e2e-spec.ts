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
          timeline: "this-quarter",
          status: "in-progress"
        })
        .set("Authorization", `Bearer ${accessToken}`);
      const featureId = createFeatureResponse.body.id;
      const createWorkItemResponse = await request(app.getHttpServer())
        .post("/work-items")
        .send({
          title: "Work Item 1",
          description: "Work Item 1 description",
          priority: "high",
          feature: featureId,
          status: "backlog"
        })
        .set("Authorization", `Bearer ${accessToken}`);
      expect(createWorkItemResponse.statusCode).toEqual(201);
      expect(createWorkItemResponse.body.title).toEqual("Work Item 1");
      expect(createWorkItemResponse.body.description).toEqual("Work Item 1 description");
      expect(createWorkItemResponse.body.priority).toEqual("high");
      expect(createWorkItemResponse.body.feature.id).toEqual(featureId);
    });
  });

  describe("/work-items (GET)", () => {
    it("should list work items", async () => {
      await request(app.getHttpServer())
        .post("/work-items")
        .send({
          title: "Work Item 1",
          description: "Work Item 1 description",
          priority: "high",
          status: "backlog"
        })
        .set("Authorization", `Bearer ${accessToken}`);
      const listWorkItemsResponse = await request(app.getHttpServer())
        .get("/work-items")
        .set("Authorization", `Bearer ${accessToken}`);
      expect(listWorkItemsResponse.statusCode).toEqual(200);
      expect(listWorkItemsResponse.body.length).toEqual(1);
      expect(listWorkItemsResponse.body[0].id).toBeDefined();
      expect(listWorkItemsResponse.body[0].title).toEqual("Work Item 1");
      expect(listWorkItemsResponse.body[0].description).toEqual("Work Item 1 description");
      expect(listWorkItemsResponse.body[0].priority).toEqual("high");
      expect(listWorkItemsResponse.body[0].status).toEqual("backlog");
    });
  });

  describe("/work-items/:id (GET)", () => {
    it("should get a work item", async () => {
      const createWorkItemResponse = await request(app.getHttpServer())
        .post("/work-items")
        .send({
          title: "Work Item 1",
          description: "Work Item 1 description",
          priority: "high",
          status: "backlog"
        })
        .set("Authorization", `Bearer ${accessToken}`);
      const workItemId = createWorkItemResponse.body.id;
      const getWorkItemResponse = await request(app.getHttpServer())
        .get(`/work-items/${workItemId}`)
        .set("Authorization", `Bearer ${accessToken}`);
      expect(getWorkItemResponse.statusCode).toEqual(200);
      expect(getWorkItemResponse.body.id).toEqual(workItemId);
      expect(getWorkItemResponse.body.title).toEqual("Work Item 1");
      expect(getWorkItemResponse.body.description).toEqual("Work Item 1 description");
      expect(getWorkItemResponse.body.priority).toEqual("high");
      expect(getWorkItemResponse.body.status).toEqual("backlog");
    });
  });
  describe("/work-items/:id (PUT)", () => {
    it("should update a work item", async () => {
      const createWorkItemResponse = await request(app.getHttpServer())
        .post("/work-items")
        .send({
          title: "Work Item 1",
          description: "Work Item 1 description",
          priority: "high",
          status: "backlog"
        })
        .set("Authorization", `Bearer ${accessToken}`);
      const workItemId = createWorkItemResponse.body.id;
      const updateWorkItemResponse = await request(app.getHttpServer())
        .put(`/work-items/${workItemId}`)
        .send({
          title: "Work Item 1 updated",
          description: "Work Item 1 description updated",
          priority: "low",
          status: "backlog"
        })
        .set("Authorization", `Bearer ${accessToken}`);
      expect(updateWorkItemResponse.statusCode).toEqual(200);
      expect(updateWorkItemResponse.body.id).toEqual(workItemId);
      expect(updateWorkItemResponse.body.title).toEqual("Work Item 1 updated");
      expect(updateWorkItemResponse.body.description).toEqual("Work Item 1 description updated");
      expect(updateWorkItemResponse.body.priority).toEqual("low");
      expect(updateWorkItemResponse.body.status).toEqual("backlog");
    });
    it("should update a work item with a feature", async () => {
      const createFeatureResponse = await request(app.getHttpServer())
        .post("/features")
        .send({
          title: "Feature 1",
          description: "Feature 1 description",
          priority: "high",
          timeline: "this-quarter",
          status: "in-progress"
        })
        .set("Authorization", `Bearer ${accessToken}`);
      const featureId = createFeatureResponse.body.id;
      const createWorkItemResponse = await request(app.getHttpServer())
        .post("/work-items")
        .send({
          title: "Work Item 1",
          description: "Work Item 1 description",
          priority: "high",
          status: "backlog"
        })
        .set("Authorization", `Bearer ${accessToken}`);
      const workItemId = createWorkItemResponse.body.id;
      const updateWorkItemResponse = await request(app.getHttpServer())
        .put(`/work-items/${workItemId}`)
        .send({
          title: "Work Item 1 updated",
          description: "Work Item 1 description updated",
          priority: "low",
          feature: featureId,
          status: "backlog"
        })
        .set("Authorization", `Bearer ${accessToken}`);
      expect(updateWorkItemResponse.statusCode).toEqual(200);
      expect(updateWorkItemResponse.body.id).toEqual(workItemId);
      expect(updateWorkItemResponse.body.title).toEqual("Work Item 1 updated");
      expect(updateWorkItemResponse.body.description).toEqual("Work Item 1 description updated");
      expect(updateWorkItemResponse.body.priority).toEqual("low");
      expect(updateWorkItemResponse.body.status).toEqual("backlog");
      expect(updateWorkItemResponse.body.feature.id).toEqual(featureId);
    });
  });
  describe("/work-items/:id (DELETE)", () => {
    it("should delete a work item", async () => {
      const createWorkItemResponse = await request(app.getHttpServer())
        .post("/work-items")
        .send({
          title: "Work Item 1",
          description: "Work Item 1 description",
          priority: "high",
          status: "backlog"
        })
        .set("Authorization", `Bearer ${accessToken}`);
      const workItemId = createWorkItemResponse.body.id;
      const deleteWorkItemResponse = await request(app.getHttpServer())
        .delete(`/work-items/${workItemId}`)
        .set("Authorization", `Bearer ${accessToken}`);
      expect(deleteWorkItemResponse.statusCode).toEqual(200);
      const getWorkItemResponse = await request(app.getHttpServer())
        .get(`/work-items/${workItemId}`)
        .set("Authorization", `Bearer ${accessToken}`);
      expect(getWorkItemResponse.statusCode).toEqual(404);
    });
  });
});
