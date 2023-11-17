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
import { TokensService } from "../src/auth/tokens.service";
import { KeyResult } from "../src/okrs/key-result.entity";

describe("OKRsController (e2e)", () => {
  let app: INestApplication;
  let accessToken: string;
  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [UsersModule, OrgsModule, TypeOrmModule.forFeature([User, RefreshToken, Org, Objective, KeyResult])],
      [AuthService, UsersService, Reflector, OkrsService, TokensService],
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
            title: "My OKR",
            description: "My OKR description"
          }
        })
        .expect(HttpStatus.CREATED)
        .expect(({ body }) => {
          expect(body.objective.id).toBeDefined();
          expect(body.objective.title).toEqual("My OKR");
          expect(body.objective.description).toEqual("My OKR description");
        });
    });
    it("should allow creating multiple key results", async () => {
      return request(app.getHttpServer())
        .post("/okrs")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          objective: {
            title: "My OKR",
            description: "My OKR description"
          },
          keyResults: [
            { title: "My Key Result 1" },
            { title: "My Key Result 2" }
          ]
        })
        .expect(HttpStatus.CREATED)
        .expect(({ body }) => {
          expect(body.objective.id).toBeDefined();
          expect(body.objective.title).toEqual("My OKR");
          expect(body.objective.description).toEqual("My OKR description");
          expect(body.keyResults).toHaveLength(2);
          expect(body.keyResults[0].id).toBeDefined();
          expect(body.keyResults[0].title).toEqual("My Key Result 1");
          expect(body.keyResults[1].id).toBeDefined();
          expect(body.keyResults[1].title).toEqual("My Key Result 2");
        });
    });
  });

  describe("/okrs (GET)", () => {
    it("should return 200", async () => {
      return request(app.getHttpServer())
        .get("/okrs")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(HttpStatus.OK)
        .expect(({ body }) => {
          expect(body).toEqual([]);
        });
    });

    it("should return 200 with OKRs", async () => {
      const okrResponse = await request(app.getHttpServer())
        .post("/okrs")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          objective: {
            title: "My OKR",
            description: "My OKR description"
          }
        });

      return request(app.getHttpServer())
        .get("/okrs")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(HttpStatus.OK)
        .expect(({ body }) => {
          expect(body).toHaveLength(1);
          expect(body[0].id).toEqual(okrResponse.body.objective.id);
          expect(body[0].title).toEqual("My OKR");
          expect(body[0].createdAt).toBeDefined();
          expect(body[0].updatedAt).toBeDefined();
        });
    });
  });

  describe("OKR (GET)", () => {
    it("should return 200", async () => {
      const okrResponse = await request(app.getHttpServer())
        .post("/okrs")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          objective: {
            title: "My OKR",
            description: "My OKR description"
          }
        });

      return request(app.getHttpServer())
        .get(`/okrs/${okrResponse.body.objective.id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(HttpStatus.OK)
        .expect(({ body }) => {
          expect(body.objective.id).toEqual(okrResponse.body.objective.id);
          expect(body.objective.title).toEqual("My OKR");
          expect(body.objective.description).toEqual("My OKR description");
          expect(body.objective.createdAt).toBeDefined();
          expect(body.objective.updatedAt).toBeDefined();
        });
    });

    it("should return 404", async () => {
      return request(app.getHttpServer())
        .get(`/okrs/123`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(HttpStatus.NOT_FOUND);
    });

    it("should return 200 with objectives and key results", async () => {
      const okrResponse = await request(app.getHttpServer())
        .post("/okrs")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          objective: {
            title: "My OKR",
            description: "My OKR description"
          },
          keyResults: [
            { title: "My Key Result 1" },
            { title: "My Key Result 2" }
          ]
        });

      return request(app.getHttpServer())
        .get(`/okrs/${okrResponse.body.objective.id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(HttpStatus.OK)
        .expect(({ body }) => {
          expect(body.objective.id).toEqual(okrResponse.body.objective.id);
          expect(body.objective.title).toEqual("My OKR");
          expect(body.objective.description).toEqual("My OKR description");
          expect(body.objective.createdAt).toBeDefined();
          expect(body.objective.updatedAt).toBeDefined();
          expect(body.keyResults).toHaveLength(2);
          expect(body.keyResults[0].id).toBeDefined();
          expect(body.keyResults[0].title).toEqual("My Key Result 1");
          expect(body.keyResults[1].id).toBeDefined();
          expect(body.keyResults[1].title).toEqual("My Key Result 2");
        });
    });
  });

  describe("OKR (PUT)", () => {
    it("should return 200", async () => {
      const okrResponse = await request(app.getHttpServer())
        .post("/okrs")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          objective: {
            title: "My OKR",
            description: "My OKR description"
          }
        });

      return request(app.getHttpServer())
        .put(`/okrs/${okrResponse.body.objective.id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          objective: {
            title: "My Other OKR",
            description: "My Other OKR description"
          }
        })
        .expect(HttpStatus.OK);
    });

    it("should update the objective with key results", async () => {
      const okrResponse = await request(app.getHttpServer())
        .post("/okrs")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          objective: {
            title: "My OKR",
            description: "My OKR description"
          },
          keyResults: [
            { title: "My Key Result 1" },
            { title: "My Key Result 2" },
            { title: "My Key Result 3" }
          ]
        });

      await request(app.getHttpServer())
        .put(`/okrs/${okrResponse.body.objective.id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          objective: {
            title: "My Other OKR",
            description: "My Other OKR description"
          },
          keyResults: [
            { id: okrResponse.body.keyResults[0].id, title: "My Other Key Result 1" },
            { id: okrResponse.body.keyResults[1].id, title: "My Other Key Result 2" },
            { title: "My Other Key Result 3" }
          ]
        })
        .expect(HttpStatus.OK);

      return request(app.getHttpServer())
        .get(`/okrs/${okrResponse.body.objective.id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(HttpStatus.OK)
        .expect(({ body }) => {
          expect(body.objective.id).toEqual(okrResponse.body.objective.id);
          expect(body.objective.title).toEqual("My Other OKR");
          expect(body.objective.description).toEqual("My Other OKR description");
          expect(body.objective.createdAt).toBeDefined();
          expect(body.objective.updatedAt).toBeDefined();
          expect(body.keyResults).toHaveLength(3);
          expect(body.keyResults[0].id).toEqual(okrResponse.body.keyResults[0].id);
          expect(body.keyResults[0].title).toEqual("My Other Key Result 1");
          expect(body.keyResults[1].id).toEqual(okrResponse.body.keyResults[1].id);
          expect(body.keyResults[1].title).toEqual("My Other Key Result 2");
          expect(body.keyResults[2].id).toBeDefined();
          expect(body.keyResults[2].title).toEqual("My Other Key Result 3");
        });
    });
  });

  describe("OKR (DELETE)", () => {
    it("should return 200", async () => {
      const okrResponse = await request(app.getHttpServer())
        .post("/okrs")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          objective: {
            title: "My OKR",
            description: "My OKR description"
          }
        });

      return request(app.getHttpServer())
        .delete(`/okrs/${okrResponse.body.objective.id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(HttpStatus.OK);
    });
  });

  describe("OKR (PATCH)", () => {
    it("should update the progress of a key result and the objective progress", async () => {
      const okrResponse = await request(app.getHttpServer())
        .post("/okrs")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          objective: {
            title: "My OKR",
            description: "My OKR description"
          },
          keyResults: [
            { title: "My Key Result 1" },
            { title: "My Key Result 2" },
            { title: "My Key Result 3" }
          ]
        });

      await request(app.getHttpServer())
        .patch(`/okrs/${okrResponse.body.objective.id}/key-results/${okrResponse.body.keyResults[0].id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          progress: 0.5
        })
        .expect(HttpStatus.OK);

      await request(app.getHttpServer())
        .patch(`/okrs/${okrResponse.body.objective.id}/key-results/${okrResponse.body.keyResults[1].id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          progress: 0.5
        })
        .expect(HttpStatus.OK);

      return request(app.getHttpServer())
        .get(`/okrs/${okrResponse.body.objective.id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(HttpStatus.OK)
        .expect(({ body }) => {
          expect(body.keyResults).toHaveLength(3);
          expect(body.keyResults[0].id).toEqual(okrResponse.body.keyResults[0].id);
          expect(body.keyResults[0].title).toEqual("My Key Result 1");
          expect(body.keyResults[0].progress).toEqual(0.5);
          expect(body.keyResults[1].id).toEqual(okrResponse.body.keyResults[1].id);
          expect(body.keyResults[1].title).toEqual("My Key Result 2");
          expect(body.keyResults[1].progress).toEqual(0.5);
          expect(body.keyResults[2].id).toEqual(okrResponse.body.keyResults[2].id);
          expect(body.keyResults[2].title).toEqual("My Key Result 3");
          expect(body.keyResults[2].progress).toEqual(0);
          expect(body.objective.progress).toEqual(0.33);
        });
    });
  });
});
