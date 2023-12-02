import { FeaturesController } from "./features.controller";
import { OrgsService } from "../../orgs/orgs.service";
import { setupTestingModule } from "../../../test/test.utils";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Org } from "../../orgs/org.entity";
import { KeyResult } from "../../okrs/key-result.entity";
import { OkrsService } from "../../okrs/okrs.service";
import { TokensService } from "../../auth/tokens.service";
import { Feature } from "./feature.entity";
import { Objective } from "../../okrs/objective.entity";
import { Priority } from "../../common/priority.enum";
import { FeaturesService } from "./features.service";
import { UsersService } from "../../users/users.service";
import { UsersModule } from "../../users/users.module";
import { MilestonesService } from "../milestones/milestones.service";
import { Milestone } from "../milestones/milestone.entity";

describe("FeaturesController", () => {
  let controller: FeaturesController;
  let cleanup: () => Promise<void>;
  let org: Org;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [TypeOrmModule.forFeature([Org, Objective, KeyResult, Feature, Milestone]), UsersModule],
      [OkrsService, OrgsService, TokensService, FeaturesService, MilestonesService],
      [FeaturesController]
    );
    cleanup = dbCleanup;
    controller = module.get<FeaturesController>(FeaturesController);
    const orgsService = module.get<OrgsService>(OrgsService);
    const usersService = module.get<UsersService>(UsersService);
    const user = await usersService.create(
      "Test User",
      "test@example.com",
      "testtesttest"
    );
    org = await orgsService.createForUser(user);
  });

  afterEach(async () => {
    await cleanup();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("when creating a feature", () => {
    it("should return 201", async () => {
      const okrResponse = await controller.create(
        {
          user: {
            org: org.id
          }
        },
        {
          title: "my feature",
          description: "my feature description",
          priority: Priority.HIGH
        });
      expect(okrResponse.title).toEqual("my feature");
      expect(okrResponse.description).toEqual("my feature description");
      expect(okrResponse.priority).toEqual(Priority.HIGH);
    });
    it("should return 400 if title is missing", async () => {
      try {
        await controller.create(
          {
            user: {
              org: org.id
            }
          },
          {
            title: null,
            description: "my feature description",
            priority: Priority.HIGH
          });
      } catch (e) {
        expect(e.message).toEqual("Bad Request");
      }
    });
  });
  describe("when getting features", () => {
    it("should return 200", async () => {
      await controller.create(
        {
          user: {
            org: org.id
          }
        },
        {
          title: "my feature",
          description: "my feature description",
          priority: Priority.HIGH
        });
      const features = await controller.list({
        user: {
          org: org.id
        }
      });
      expect(features[0].title).toEqual("my feature");
      expect(features[0].priority).toEqual(Priority.HIGH);
      expect(features[0].createdAt).toBeDefined();
      expect(features[0].updatedAt).toBeDefined();
    });
  });
  describe("when getting features without milestone", () => {
    it("should return 200", async () => {
      await controller.create(
        {
          user: {
            org: org.id
          }
        },
        {
          title: "my feature",
          description: "my feature description",
          priority: Priority.HIGH
        });
      const features = await controller.listWithoutMilestone({
        user: {
          org: org.id
        }
      });
      expect(features[0].title).toEqual("my feature");
      expect(features[0].priority).toEqual(Priority.HIGH);
      expect(features[0].createdAt).toBeDefined();
      expect(features[0].updatedAt).toBeDefined();
    });
  });
});
