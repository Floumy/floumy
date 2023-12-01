import { FeaturesService } from "./features.service";
import { OkrsService } from "../../okrs/okrs.service";
import { OrgsService } from "../../orgs/orgs.service";
import { setupTestingModule } from "../../../test/test.utils";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Objective } from "../../okrs/objective.entity";
import { Org } from "../../orgs/org.entity";
import { KeyResult } from "../../okrs/key-result.entity";
import { Feature } from "./feature.entity";
import { UsersService } from "../../users/users.service";
import { Priority } from "../../common/priority.enum";
import { User } from "../../users/user.entity";
import { MilestonesService } from "../milestones/milestones.service";
import { Milestone } from "../milestones/milestone.entity";

describe("FeaturesService", () => {
  let usersService: UsersService;
  let service: FeaturesService;
  let milestonesService: MilestonesService;
  let okrsService: OkrsService;
  let orgsService: OrgsService;

  let org: Org;

  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [TypeOrmModule.forFeature([Objective, Org, KeyResult, Feature, User, Milestone])],
      [OkrsService, OrgsService, FeaturesService, UsersService, MilestonesService]
    );
    cleanup = dbCleanup;
    service = module.get<FeaturesService>(FeaturesService);
    usersService = module.get<UsersService>(UsersService);
    okrsService = module.get<OkrsService>(OkrsService);
    orgsService = module.get<OrgsService>(OrgsService);
    milestonesService = module.get<MilestonesService>(MilestonesService);
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
    expect(service).toBeDefined();
  });

  describe("when creating a feature", () => {
    it("should return a feature", async () => {
      const feature = await service.createFeature(org.id, {
        title: "my feature",
        description: "my feature description",
        priority: Priority.HIGH
      });
      expect(feature.id).toBeDefined();
      expect(feature.title).toEqual("my feature");
      expect(feature.description).toEqual("my feature description");
      expect(feature.priority).toEqual(Priority.HIGH);
    });
    it("should throw an error if the org does not exist", async () => {
      await expect(
        service.createFeature("non-existent-org", {
          title: "my feature",
          description: "my feature description",
          priority: Priority.HIGH
        })
      ).rejects.toThrowError();
    });
    it("should throw an error if the title is not provided", async () => {
      await expect(
        service.createFeature(org.id, {
          title: "",
          description: "my feature description",
          priority: Priority.HIGH
        })
      ).rejects.toThrowError();
    });
    it("should throw an error if the priority is not provided", async () => {
      await expect(
        service.createFeature(org.id, {
          title: "my feature",
          description: "my feature description",
          priority: null
        })
      ).rejects.toThrowError();
    });
    it("should create a feature with a key result", async () => {
      const objective = await okrsService.create(org.id, {
        objective: {
          title: "my objective"
        },
        keyResults: [
          {
            title: "my key result"
          }
        ]
      });
      const feature = await service.createFeature(org.id, {
        title: "my feature",
        description: "my feature description",
        priority: Priority.HIGH,
        keyResult: objective.keyResults[0].id
      });
      expect(feature.keyResult).toBeDefined();
      expect(feature.keyResult.id).toEqual(objective.keyResults[0].id);
      expect(feature.keyResult.title).toEqual(objective.keyResults[0].title);
    });
    it("should throw an error if the key result does not exist", async () => {
      await expect(
        service.createFeature(org.id, {
          title: "my feature",
          description: "my feature description",
          priority: Priority.HIGH,
          keyResult: "non-existent-key-result"
        })
      ).rejects.toThrowError();
    });
    it("should throw an error if the key result does not belong to the org", async () => {
      const objective = await okrsService.create(org.id, {
        objective: {
          title: "my objective"
        },
        keyResults: [
          {
            title: "my key result"
          }
        ]
      });
      const otherOrg = await orgsService.createForUser(
        await usersService.create(
          "Other User",
          "testing@example.com",
          "testtesttest"
        )
      );
      await expect(
        service.createFeature(otherOrg.id, {
          title: "my feature",
          description: "my feature description",
          priority: Priority.HIGH,
          keyResult: objective.keyResults[0].id
        })
      ).rejects.toThrowError();
    });
    it("should create a feature with a milestone", async () => {
      const milestone = await milestonesService.createMilestone(org.id, {
        title: "my milestone",
        description: "my milestone description",
        dueDate: "2020-01-01"
      });
      const feature = await service.createFeature(org.id, {
        title: "my feature",
        description: "my feature description",
        priority: Priority.HIGH,
        milestone: milestone.id
      });
      expect(feature.milestone).toBeDefined();
      expect(feature.milestone.id).toEqual(milestone.id);
      expect(feature.milestone.title).toEqual(milestone.title);
    });
  });
  describe("when listing features", () => {
    it("should return a list of features", async () => {
      const objective = await okrsService.create(org.id, {
        objective: {
          title: "my objective"
        },
        keyResults: [
          {
            title: "my key result"
          }
        ]
      });
      await service.createFeature(org.id, {
        title: "my feature",
        description: "my feature description",
        priority: Priority.HIGH,
        keyResult: objective.keyResults[0].id
      });
      const features = await service.listFeatures(org.id);
      expect(features.length).toEqual(1);
      expect(features[0].title).toEqual("my feature");
      expect(features[0].priority).toEqual(Priority.HIGH);
      expect(features[0].createdAt).toBeDefined();
      expect(features[0].updatedAt).toBeDefined();
    });
  });

});
