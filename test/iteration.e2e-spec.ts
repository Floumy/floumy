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
import { IterationsController } from "../src/iterations/iterations.controller";
import { Iteration } from "../src/iterations/Iteration.entity";
import { IterationsService } from "../src/iterations/iterations.service";

describe("Iteration (e2e)", () => {
  let app: INestApplication;
  let accessToken: string;
  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [UsersModule, OrgsModule, BacklogModule, OkrsModule, TypeOrmModule.forFeature([User, RefreshToken, Org, Feature, Objective, KeyResult, WorkItem, Milestone, Iteration])],
      [AuthService, UsersService, Reflector, TokensService, FeaturesService, WorkItemsService, OkrsService, MilestonesService, IterationsService],
      [AuthController, FeaturesController, WorkItemsController, IterationsController]
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

  describe("/iterations (POST)", () => {
    it("should create a new iteration", async () => {
      const response = await request(app.getHttpServer())
        .post("/iterations")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          goal: "Goal 1",
          startDate: "2020-01-01",
          duration: 1
        })
        .expect(201);

      expect(response.body.id).toBeDefined();
      expect(response.body.title).toBeDefined();
      expect(response.body.goal).toEqual("Goal 1");
      expect(response.body.startDate).toEqual("2020-01-01");
      expect(response.body.endDate).toEqual("2020-01-07");
      expect(response.body.duration).toEqual(1);
    });
  });

  describe("/iterations (GET)", () => {
    it("should return a list of iterations", async () => {
      await request(app.getHttpServer())
        .post("/iterations")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          goal: "Goal 1",
          startDate: "2020-01-01",
          duration: 1
        })
        .expect(201);

      const response = await request(app.getHttpServer())
        .get("/iterations")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body[0].id).toBeDefined();
      expect(response.body[0].title).toBeDefined();
      expect(response.body[0].goal).toEqual("Goal 1");
      expect(response.body[0].startDate).toEqual("2020-01-01");
      expect(response.body[0].endDate).toEqual("2020-01-07");
      expect(response.body[0].duration).toEqual(1);
    });
  });

  describe("/iterations/:id (GET)", () => {
    it("should return an iteration", async () => {
      const iteration = await request(app.getHttpServer())
        .post("/iterations")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          goal: "Goal 1",
          startDate: "2020-01-01",
          duration: 1
        })
        .expect(201);

      const response = await request(app.getHttpServer())
        .get(`/iterations/${iteration.body.id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.id).toBeDefined();
      expect(response.body.title).toBeDefined();
      expect(response.body.goal).toEqual("Goal 1");
      expect(response.body.startDate).toEqual("2020-01-01");
      expect(response.body.endDate).toEqual("2020-01-07");
      expect(response.body.duration).toEqual(1);
    });
  });

  describe("/iterations/:id (PUT)", () => {
    it("should update an iteration", async () => {
      const iteration = await request(app.getHttpServer())
        .post("/iterations")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          goal: "Goal 1",
          startDate: "2020-01-01",
          duration: 1
        })
        .expect(201);

      const response = await request(app.getHttpServer())
        .put(`/iterations/${iteration.body.id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          goal: "Goal 2",
          startDate: "2020-01-01",
          duration: 1
        })
        .expect(200);

      expect(response.body.id).toBeDefined();
      expect(response.body.title).toBeDefined();
      expect(response.body.goal).toEqual("Goal 2");
      expect(response.body.startDate).toEqual("2020-01-01");
      expect(response.body.endDate).toEqual("2020-01-07");
      expect(response.body.duration).toEqual(1);
    });
  });
  describe("/iterations/:id (DELETE)", () => {
    it("should delete an iteration", async () => {
      const iteration = await request(app.getHttpServer())
        .post("/iterations")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          goal: "Goal 1",
          startDate: "2020-01-01",
          duration: 1
        })
        .expect(201);

      await request(app.getHttpServer())
        .delete(`/iterations/${iteration.body.id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .get(`/iterations/${iteration.body.id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(404);
    });
  });
  describe("/iterations/:id/start (POST)", () => {
    it("should start an iteration", async () => {
      const iteration = await request(app.getHttpServer())
        .post("/iterations")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          goal: "Goal 1",
          startDate: "2020-01-01",
          duration: 1
        })
        .expect(201);

      const response = await request(app.getHttpServer())
        .post(`/iterations/${iteration.body.id}/start`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.id).toBeDefined();
      expect(response.body.title).toBeDefined();
      expect(response.body.goal).toEqual("Goal 1");
      expect(response.body.startDate).toEqual("2020-01-01");
      expect(response.body.endDate).toEqual("2020-01-07");
      expect(response.body.actualStartDate).toBeDefined();
      expect(response.body.duration).toEqual(1);
      expect(response.body.status).toEqual("active");
    });
  });
  describe("/iterations/:id/complete (POST)", () => {
    it("should complete an iteration", async () => {
      const iteration = await request(app.getHttpServer())
        .post("/iterations")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          goal: "Goal 1",
          startDate: "2020-01-01",
          duration: 1
        })
        .expect(201);

      await request(app.getHttpServer())
        .post(`/iterations/${iteration.body.id}/start`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);

      const response = await request(app.getHttpServer())
        .post(`/iterations/${iteration.body.id}/complete`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.id).toBeDefined();
      expect(response.body.title).toBeDefined();
      expect(response.body.goal).toEqual("Goal 1");
      expect(response.body.startDate).toEqual("2020-01-01");
      expect(response.body.endDate).toEqual("2020-01-07");
      expect(response.body.actualEndDate).toBeDefined();
      expect(response.body.duration).toEqual(1);
      expect(response.body.status).toEqual("completed");
    });
  });
  describe("/iterations/active (GET)", () => {
    it("should return the active iteration", async () => {
      const iterationResponse = await request(app.getHttpServer())
        .post("/iterations")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          goal: "Goal 1",
          startDate: "2019-01-01",
          duration: 1
        })
        .expect(201);

      await request(app.getHttpServer())
        .post(`/iterations/${iterationResponse.body.id}/start`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);

      const response = await request(app.getHttpServer())
        .get("/iterations/active")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.id).toBeDefined();
      expect(response.body.title).toBeDefined();
      expect(response.body.goal).toEqual("Goal 1");
      expect(response.body.startDate).toEqual("2019-01-01");
      expect(response.body.actualStartDate).toBeDefined();
      expect(response.body.duration).toEqual(1);
    });
    it("should return work items for the active iteration", async () => {
      const iterationResponse = await request(app.getHttpServer())
        .post("/iterations")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          goal: "Goal 1",
          startDate: "2019-01-01",
          duration: 1
        })
        .expect(201);

      await request(app.getHttpServer())
        .post(`/iterations/${iterationResponse.body.id}/start`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);

      const workItemResponse = await request(app.getHttpServer())
        .post("/work-items")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          title: "Work Item 1",
          description: "Work Item 1",
          priority: "low",
          type: "bug",
          status: "planned",
          iteration: iterationResponse.body.id
        })
        .expect(201);

      const response = await request(app.getHttpServer())
        .get("/iterations/active")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.workItems[0].id).toEqual(workItemResponse.body.id);
      expect(response.body.workItems[0].title).toEqual("Work Item 1");
      expect(response.body.workItems[0].description).toEqual("Work Item 1");
      expect(response.body.workItems[0].priority).toEqual("low");
      expect(response.body.workItems[0].type).toEqual("bug");
      expect(response.body.workItems[0].status).toEqual("planned");
    });
  });
});
