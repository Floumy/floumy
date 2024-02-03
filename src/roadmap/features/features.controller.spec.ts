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
import { BacklogModule } from "../../backlog/backlog.module";
import { FeatureStatus } from "./featurestatus.enum";
import { Iteration } from "../../iterations/Iteration.entity";
import { File } from "../../files/file.entity";
import { FeatureFile } from "./feature-file.entity";

describe("FeaturesController", () => {
  let controller: FeaturesController;
  let milestoneService: MilestonesService;
  let cleanup: () => Promise<void>;
  let org: Org;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [TypeOrmModule.forFeature([Org, Objective, KeyResult, Feature, Milestone, Iteration, File, FeatureFile]), UsersModule, BacklogModule],
      [OkrsService, OrgsService, TokensService, FeaturesService, MilestonesService],
      [FeaturesController]
    );
    cleanup = dbCleanup;
    controller = module.get<FeaturesController>(FeaturesController);
    const orgsService = module.get<OrgsService>(OrgsService);
    const usersService = module.get<UsersService>(UsersService);
    milestoneService = module.get<MilestonesService>(MilestonesService);

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
      const featureResponse = await controller.create(
        {
          user: {
            org: org.id
          }
        },
        {
          title: "my feature",
          description: "my feature description",
          priority: Priority.HIGH,
          status: FeatureStatus.CLOSED
        });
      expect(featureResponse.title).toEqual("my feature");
      expect(featureResponse.description).toEqual("my feature description");
      expect(featureResponse.priority).toEqual(Priority.HIGH);
      expect(featureResponse.status).toEqual(FeatureStatus.CLOSED);
      expect(featureResponse.createdAt).toBeDefined();
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
            priority: Priority.HIGH,
            status: FeatureStatus.PLANNED
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
          priority: Priority.HIGH,
          status: FeatureStatus.PLANNED
        });
      const features = await controller.list({
        user: {
          org: org.id
        }
      });
      expect(features[0].title).toEqual("my feature");
      expect(features[0].priority).toEqual(Priority.HIGH);
      expect(features[0].progress).toEqual(0);
      expect(features[0].workItemsCount).toEqual(0);
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
          priority: Priority.HIGH,
          status: FeatureStatus.PLANNED
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
  describe("when getting a feature", () => {
    it("should return 200", async () => {
      const featureResponse = await controller.create(
        {
          user: {
            org: org.id
          }
        },
        {
          title: "my feature",
          description: "my feature description",
          priority: Priority.HIGH,
          status: FeatureStatus.PLANNED
        });
      const feature = await controller.get({
        user: {
          org: org.id
        }
      }, featureResponse.id);
      expect(feature.title).toEqual("my feature");
      expect(feature.priority).toEqual(Priority.HIGH);
      expect(feature.createdAt).toBeDefined();
      expect(feature.updatedAt).toBeDefined();
    });
  });
  describe("when updating a feature", () => {
    it("should return 200", async () => {
      const featureResponse = await controller.create(
        {
          user: {
            org: org.id
          }
        },
        {
          title: "my feature",
          description: "my feature description",
          priority: Priority.HIGH,
          status: FeatureStatus.PLANNED
        });
      const feature = await controller.update({
        user: {
          org: org.id
        }
      }, featureResponse.id, {
        title: "my feature",
        description: "my feature description",
        priority: Priority.HIGH,
        status: FeatureStatus.CLOSED
      });
      expect(feature.title).toEqual("my feature");
      expect(feature.priority).toEqual(Priority.HIGH);
      expect(feature.status).toEqual(FeatureStatus.CLOSED);
      expect(feature.createdAt).toBeDefined();
      expect(feature.updatedAt).toBeDefined();
    });
  });
  describe("when deleting a feature", () => {
    it("should return 200", async () => {
      const featureResponse = await controller.create(
        {
          user: {
            org: org.id
          }
        },
        {
          title: "my feature",
          description: "my feature description",
          priority: Priority.HIGH,
          status: FeatureStatus.PLANNED
        });
      await controller.delete({
        user: {
          org: org.id
        }
      }, featureResponse.id);
    });
  });
  describe("when patching the feature", () => {
    it("should update the status", async () => {
      const featureResponse = await controller.create(
        {
          user: {
            org: org.id
          }
        },
        {
          title: "my feature",
          description: "my feature description",
          priority: Priority.HIGH,
          status: FeatureStatus.PLANNED
        });
      const feature = await controller.patch({
        user: {
          org: org.id
        }
      }, featureResponse.id, {
        status: FeatureStatus.CLOSED
      });
      expect(feature.title).toEqual("my feature");
      expect(feature.priority).toEqual(Priority.HIGH);
      expect(feature.status).toEqual(FeatureStatus.CLOSED);
      expect(feature.createdAt).toBeDefined();
      expect(feature.updatedAt).toBeDefined();
    });
    it("should update the priority", async () => {
      const featureResponse = await controller.create(
        {
          user: {
            org: org.id
          }
        },
        {
          title: "my feature",
          description: "my feature description",
          priority: Priority.HIGH,
          status: FeatureStatus.PLANNED
        });
      const feature = await controller.patch({
        user: {
          org: org.id
        }
      }, featureResponse.id, {
        priority: Priority.LOW
      });
      expect(feature.title).toEqual("my feature");
      expect(feature.priority).toEqual(Priority.LOW);
      expect(feature.status).toEqual(FeatureStatus.PLANNED);
      expect(feature.createdAt).toBeDefined();
      expect(feature.updatedAt).toBeDefined();
    });
    it("should update the milestone", async () => {
      const milestone = await milestoneService.createMilestone(org.id, {
        title: "my milestone",
        description: "my milestone description",
        dueDate: "2020-01-01"
      });
      const featureResponse = await controller.create(
        {
          user: {
            org: org.id
          }
        },
        {
          title: "my feature",
          description: "my feature description",
          priority: Priority.HIGH,
          status: FeatureStatus.PLANNED
        });
      const feature = await controller.patch({
        user: {
          org: org.id
        }
      }, featureResponse.id, {
        milestone: milestone.id
      });
      expect(feature.title).toEqual("my feature");
      expect(feature.priority).toEqual(Priority.HIGH);
      expect(feature.status).toEqual(FeatureStatus.PLANNED);
      expect(feature.milestone.id).toEqual(milestone.id);
      expect(feature.createdAt).toBeDefined();
      expect(feature.updatedAt).toBeDefined();
    });
  });
});
