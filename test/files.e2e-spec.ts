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
import { File } from "../src/files/file.entity";
import { FilesService } from "../src/files/files.service";
import { FilesController } from "../src/files/files.controller";
import { FilesStorageRepository } from "../src/files/files-storage.repository";
import { WorkItemFile } from "../src/backlog/work-items/work-item-file.entity";

describe("Files (e2e)", () => {
  let app: INestApplication;
  let accessToken: string;
  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    const mockS3Client = {
      send: () => ({
        $metadata: {
          httpStatusCode: 200
        },
        Location: "https://test-bucket.nyc3.digitaloceanspaces.com"
      })
    };

    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [UsersModule, OrgsModule, BacklogModule, OkrsModule, TypeOrmModule.forFeature([User, RefreshToken, Org, Feature, Objective, KeyResult, WorkItem, Milestone, Iteration, File, WorkItemFile])],
      [AuthService, UsersService, Reflector, TokensService, FeaturesService, WorkItemsService, OkrsService, MilestonesService, IterationsService, FilesService, FilesStorageRepository, {
        provide: "S3_CLIENT",
        useValue: mockS3Client
      }],
      [AuthController, FeaturesController, WorkItemsController, IterationsController, FilesController]
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

  describe("POST /files", () => {
    it("should upload a file", async () => {
      const response = await request(app.getHttpServer())
        .post("/files")
        .set("Authorization", `Bearer ${accessToken}`)
        .attach("file", Buffer.from("test"), "test.txt")
        .expect(201);

      expect(response.body).toEqual({
        id: expect.any(String),
        name: "test.txt",
        size: 4,
        type: "text/plain"
      });
    });
  });

  describe("DELETE /files/:id", () => {
    it("should delete a file", async () => {
      const uploadResponse = await request(app.getHttpServer())
        .post("/files")
        .set("Authorization", `Bearer ${accessToken}`)
        .attach("file", Buffer.from("test"), "test.txt")
        .expect(201);

      await request(app.getHttpServer())
        .delete(`/files/${uploadResponse.body.id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .get(`/files/${uploadResponse.body.id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(404);
    });
  });
});
