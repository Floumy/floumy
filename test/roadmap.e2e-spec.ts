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
import { MilestonesController } from "../src/roadmap/milestones/milestones.controller";
import { Milestone } from "../src/roadmap/milestones/milestone.entity";
import { MilestonesService } from "../src/roadmap/milestones/milestones.service";

describe("FeaturesController (e2e)", () => {
  let app: INestApplication;
  let accessToken: string;
  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [UsersModule, OrgsModule, TypeOrmModule.forFeature([User, RefreshToken, Org, Objective, KeyResult, Feature, Milestone])],
      [AuthService, UsersService, Reflector, OkrsService, TokensService, FeaturesService, MilestonesService],
      [AuthController, FeaturesController, OkrsController, MilestonesController]
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
          expect(body.keyResult.id).toEqual(okrResponse.body.keyResults[0].id);
          expect(body.keyResult.title).toEqual("My Key Result 1");
        });
    });
  });
  describe("/features (GET)", () => {
    it("should return 200", async () => {
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
      await request(app.getHttpServer())
        .post("/features")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          title: "my feature",
          description: "my feature description",
          priority: "medium",
          timeline: "this-quarter",
          keyResult: okrResponse.body.keyResults[0].id
        })
        .expect(HttpStatus.CREATED);
      return request(app.getHttpServer())
        .get("/features")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(HttpStatus.OK)
        .expect(({ body }) => {
          expect(body.length).toEqual(1);
          expect(body[0].id).toBeDefined();
          expect(body[0].title).toEqual("my feature");
          expect(body[0].priority).toEqual("medium");
          expect(body[0].createdAt).toBeDefined();
          expect(body[0].updatedAt).toBeDefined();
        });
    });
  });
  describe("/features/without-milestone (GET)", () => {
    it("should return 200", async () => {
      await request(app.getHttpServer())
        .post("/features")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          title: "my feature",
          description: "my feature description",
          priority: "medium",
          timeline: "this-quarter"
        })
        .expect(HttpStatus.CREATED);
      return request(app.getHttpServer())
        .get("/features/without-milestone")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(HttpStatus.OK)
        .expect(({ body }) => {
          expect(body.length).toEqual(1);
          expect(body[0].id).toBeDefined();
          expect(body[0].title).toEqual("my feature");
          expect(body[0].priority).toEqual("medium");
          expect(body[0].createdAt).toBeDefined();
          expect(body[0].updatedAt).toBeDefined();
        });
    });
  });
  describe("/milestones (POST)", () => {
    it("should return 201", async () => {
      return request(app.getHttpServer())
        .post("/milestones")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          title: "my milestone",
          description: "my milestone description",
          dueDate: "2020-01-01",
          timeline: "this-quarter"
        })
        .expect(HttpStatus.CREATED)
        .expect(({ body }) => {
          expect(body.id).toBeDefined();
          expect(body.title).toEqual("my milestone");
          expect(body.description).toEqual("my milestone description");
          expect(body.dueDate).toEqual("2020-01-01");
          expect(body.timeline).toEqual("past");
        });
    });
  });
  describe("/milestones/list (GET)", () => {
    it("should return 200", async () => {
      await request(app.getHttpServer())
        .post("/milestones")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          title: "my milestone",
          description: "my milestone description",
          dueDate: "2020-01-01"
        })
        .expect(HttpStatus.CREATED);
      return request(app.getHttpServer())
        .get("/milestones")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(HttpStatus.OK)
        .expect(({ body }) => {
          expect(body.length).toEqual(1);
          expect(body[0].id).toBeDefined();
          expect(body[0].title).toEqual("my milestone");
          expect(body[0].dueDate).toEqual("2020-01-01");
        });
    });
  });
  describe("/milestones (GET)", () => {
    it("should return 200", async () => {
      const milestoneResponse = await request(app.getHttpServer())
        .post("/milestones")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          title: "my milestone",
          description: "my milestone description",
          dueDate: "2020-01-01"
        })
        .expect(HttpStatus.CREATED);
      await request(app.getHttpServer())
        .post("/features")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          title: "my feature",
          description: "my feature description",
          priority: "medium",
          timeline: "this-quarter",
          milestone: milestoneResponse.body.id
        })
        .expect(HttpStatus.CREATED);
      return request(app.getHttpServer())
        .get("/milestones")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(HttpStatus.OK)
        .expect(({ body }) => {
          expect(body.length).toEqual(1);
          expect(body[0].id).toBeDefined();
          expect(body[0].title).toEqual("my milestone");
          expect(body[0].dueDate).toEqual("2020-01-01");
          expect(body[0].features.length).toEqual(1);
          expect(body[0].features[0].id).toBeDefined();
          expect(body[0].features[0].title).toEqual("my feature");
          expect(body[0].features[0].priority).toEqual("medium");
          expect(body[0].features[0].createdAt).toBeDefined();
          expect(body[0].features[0].updatedAt).toBeDefined();
        });
    });
  });
  describe("/milestones/:id (GET)", () => {
    it("should return 200", async () => {
      const milestoneResponse = await request(app.getHttpServer())
        .post("/milestones")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          title: "my milestone",
          description: "my milestone description",
          dueDate: "2020-01-01"
        })
        .expect(HttpStatus.CREATED);
      await request(app.getHttpServer())
        .post("/features")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          title: "my feature",
          description: "my feature description",
          priority: "medium",
          timeline: "this-quarter",
          milestone: milestoneResponse.body.id
        })
        .expect(HttpStatus.CREATED);
      return request(app.getHttpServer())
        .get(`/milestones/${milestoneResponse.body.id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(HttpStatus.OK)
        .expect(({ body }) => {
          expect(body.id).toBeDefined();
          expect(body.title).toEqual("my milestone");
          expect(body.dueDate).toEqual("2020-01-01");
        });
    });
  });
  describe("/milestones/:id (PUT)", () => {
    it("should return 200", async () => {
      const milestoneResponse = await request(app.getHttpServer())
        .post("/milestones")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          title: "my milestone",
          description: "my milestone description",
          dueDate: "2020-01-01"
        })
        .expect(HttpStatus.CREATED);
      return request(app.getHttpServer())
        .put(`/milestones/${milestoneResponse.body.id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          title: "my milestone updated",
          description: "my milestone description updated",
          dueDate: "2020-02-01"
        })
        .expect(HttpStatus.OK)
        .expect(({ body }) => {
          expect(body.id).toBeDefined();
          expect(body.title).toEqual("my milestone updated");
          expect(body.description).toEqual("my milestone description updated");
          expect(body.dueDate).toEqual("2020-02-01");
        });
    });
  });
  describe("/milestones/:id (DELETE)", () => {
    it("should return 200", async () => {
      const milestoneResponse = await request(app.getHttpServer())
        .post("/milestones")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          title: "my milestone",
          description: "my milestone description",
          dueDate: "2020-01-01"
        })
        .expect(HttpStatus.CREATED);
      return request(app.getHttpServer())
        .delete(`/milestones/${milestoneResponse.body.id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(HttpStatus.OK);
    });
  });
  describe("/features/:id (GET)", () => {
    it("should return 200", async () => {
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
      const milestoneResponse = await request(app.getHttpServer())
        .post("/milestones")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          title: "my milestone",
          description: "my milestone description",
          dueDate: "2020-01-01"
        })
        .expect(HttpStatus.CREATED);
      const featureResponse = await request(app.getHttpServer())
        .post("/features")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          title: "my feature",
          description: "my feature description",
          priority: "medium",
          timeline: "this-quarter",
          keyResult: okrResponse.body.keyResults[0].id,
          milestone: milestoneResponse.body.id
        })
        .expect(HttpStatus.CREATED);
      return request(app.getHttpServer())
        .get(`/features/${featureResponse.body.id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(HttpStatus.OK)
        .expect(({ body }) => {
          expect(body.id).toBeDefined();
          expect(body.title).toEqual("my feature");
          expect(body.description).toEqual("my feature description");
          expect(body.priority).toEqual("medium");
          expect(body.keyResult.id).toEqual(okrResponse.body.keyResults[0].id);
          expect(body.keyResult.title).toEqual("My Key Result 1");
          expect(body.milestone.id).toEqual(milestoneResponse.body.id);
          expect(body.milestone.title).toEqual("my milestone");
        });
    });
  });
  describe("/features/:id (PUT)", () => {
    it("should return 200", async () => {
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
      const milestoneResponse = await request(app.getHttpServer())
        .post("/milestones")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          title: "my milestone",
          description: "my milestone description",
          dueDate: "2020-01-01"
        })
        .expect(HttpStatus.CREATED);
      const featureResponse = await request(app.getHttpServer())
        .post("/features")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          title: "my feature",
          description: "my feature description",
          priority: "medium",
          timeline: "this-quarter",
          keyResult: okrResponse.body.keyResults[0].id,
          milestone: milestoneResponse.body.id
        })
        .expect(HttpStatus.CREATED);
      return request(app.getHttpServer())
        .put(`/features/${featureResponse.body.id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          title: "my feature updated",
          description: "my feature description updated",
          priority: "high",
          timeline: "this-quarter",
          keyResult: okrResponse.body.keyResults[1].id,
          milestone: null
        })
        .expect(HttpStatus.OK)
        .expect(({ body }) => {
          expect(body.id).toBeDefined();
          expect(body.title).toEqual("my feature updated");
          expect(body.description).toEqual("my feature description updated");
          expect(body.priority).toEqual("high");
          expect(body.keyResult.id).toEqual(okrResponse.body.keyResults[1].id);
          expect(body.keyResult.title).toEqual("My Key Result 2");
          expect(body.milestone).toBeUndefined();
        });
    });
  });
  describe("/features/:id (DELETE)", () => {
    it("should return 200", async () => {
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
      const milestoneResponse = await request(app.getHttpServer())
        .post("/milestones")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          title: "my milestone",
          description: "my milestone description",
          dueDate: "2020-01-01"
        })
        .expect(HttpStatus.CREATED);
      const featureResponse = await request(app.getHttpServer())
        .post("/features")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          title: "my feature",
          description: "my feature description",
          priority: "medium",
          timeline: "this-quarter",
          keyResult: okrResponse.body.keyResults[0].id,
          milestone: milestoneResponse.body.id
        })
        .expect(HttpStatus.CREATED);
      return request(app.getHttpServer())
        .delete(`/features/${featureResponse.body.id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(HttpStatus.OK);
    });
  });
});
