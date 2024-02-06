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
import { WorkItemFile } from "../src/backlog/work-items/work-item-file.entity";
import { FeatureFile } from "../src/roadmap/features/feature-file.entity";

describe("Orgs (e2e)", () => {
  let app: INestApplication;
  let accessToken: string;
  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [UsersModule, OrgsModule, BacklogModule, OkrsModule, TypeOrmModule.forFeature([User, RefreshToken, Org, Feature, Objective, KeyResult, WorkItem, Milestone, Iteration, File, FeatureFile, WorkItemFile])],
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

  describe("when listing members", () => {
    it("should return the members of the org", async () => {
      const response = await request(app.getHttpServer())
        .get("/orgs/members")
        .set("Authorization", `Bearer ${accessToken}`);
      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].id).toBeDefined();
      expect(response.body[0].email).toBe("john.doe@example.com");
      expect(response.body[0].name).toBe("John Doe");
      expect(response.body[0].createdAt).toBeDefined();
    });
  });
});
