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
import { Timeline } from "../../common/timeline.enum";
import { WorkItemStatus } from "../../backlog/work-items/work-item-status.enum";
import { WorkItemsService } from "../../backlog/work-items/work-items.service";
import { WorkItem } from "../../backlog/work-items/work-item.entity";
import { WorkItemType } from "../../backlog/work-items/work-item-type.enum";

describe("FeaturesService", () => {
  let usersService: UsersService;
  let service: FeaturesService;
  let workItemsService: WorkItemsService;
  let milestonesService: MilestonesService;
  let okrsService: OkrsService;
  let orgsService: OrgsService;

  let org: Org;

  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [TypeOrmModule.forFeature([Objective, Org, KeyResult, Feature, User, Milestone, WorkItem])],
      [OkrsService, OrgsService, FeaturesService, UsersService, MilestonesService, WorkItemsService]
    );
    cleanup = dbCleanup;
    service = module.get<FeaturesService>(FeaturesService);
    usersService = module.get<UsersService>(UsersService);
    okrsService = module.get<OkrsService>(OkrsService);
    orgsService = module.get<OrgsService>(OrgsService);
    milestonesService = module.get<MilestonesService>(MilestonesService);
    workItemsService = module.get<WorkItemsService>(WorkItemsService);
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
        priority: Priority.HIGH,
        timeline: Timeline.THIS_QUARTER
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
          priority: Priority.HIGH,
          timeline: Timeline.THIS_QUARTER
        })
      ).rejects.toThrowError();
    });
    it("should throw an error if the title is not provided", async () => {
      await expect(
        service.createFeature(org.id, {
          title: "",
          description: "my feature description",
          priority: Priority.HIGH,
          timeline: Timeline.THIS_QUARTER
        })
      ).rejects.toThrowError();
    });
    it("should throw an error if the priority is not provided", async () => {
      await expect(
        service.createFeature(org.id, {
          title: "my feature",
          description: "my feature description",
          priority: null,
          timeline: Timeline.THIS_QUARTER
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
        keyResult: objective.keyResults[0].id,
        timeline: Timeline.THIS_QUARTER
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
          keyResult: "non-existent-key-result",
          timeline: Timeline.THIS_QUARTER
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
          keyResult: objective.keyResults[0].id,
          timeline: Timeline.NEXT_QUARTER
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
        milestone: milestone.id,
        timeline: Timeline.THIS_QUARTER
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
        keyResult: objective.keyResults[0].id,
        timeline: Timeline.THIS_QUARTER
      });
      const features = await service.listFeatures(org.id);
      expect(features.length).toEqual(1);
      expect(features[0].title).toEqual("my feature");
      expect(features[0].priority).toEqual(Priority.HIGH);
      expect(features[0].createdAt).toBeDefined();
      expect(features[0].updatedAt).toBeDefined();
    });
  });
  describe("when listing features without milestone", () => {
    it("should return a list of features", async () => {
      await service.createFeature(org.id, {
        title: "my feature",
        description: "my feature description",
        priority: Priority.HIGH,
        timeline: Timeline.NEXT_QUARTER
      });
      const features = await service.listFeaturesWithoutMilestone(org.id);
      expect(features.length).toEqual(1);
      expect(features[0].title).toEqual("my feature");
      expect(features[0].priority).toEqual(Priority.HIGH);
      expect(features[0].createdAt).toBeDefined();
      expect(features[0].updatedAt).toBeDefined();
    });
  });
  describe("when getting a feature", () => {
    it("should return a feature", async () => {
      const feature = await service.createFeature(org.id, {
        title: "my feature",
        description: "my feature description",
        priority: Priority.HIGH,
        timeline: Timeline.THIS_QUARTER
      });
      const foundFeature = await service.getFeature(org.id, feature.id);
      expect(foundFeature.id).toEqual(feature.id);
      expect(foundFeature.title).toEqual(feature.title);
      expect(foundFeature.priority).toEqual(feature.priority);
      expect(foundFeature.createdAt).toBeDefined();
      expect(foundFeature.updatedAt).toBeDefined();
    });
    it("should throw an error if the feature does not exist", async () => {
      await expect(
        service.getFeature(org.id, "non-existent-feature")
      ).rejects.toThrowError();
    });
    it("should return the feature with the key result", async () => {
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
        keyResult: objective.keyResults[0].id,
        timeline: Timeline.THIS_QUARTER
      });
      const foundFeature = await service.getFeature(org.id, feature.id);
      expect(foundFeature.keyResult).toBeDefined();
      expect(foundFeature.keyResult.id).toEqual(objective.keyResults[0].id);
      expect(foundFeature.keyResult.title).toEqual(objective.keyResults[0].title);
    });
    it("should return the feature with the milestone", async () => {
      const milestone = await milestonesService.createMilestone(org.id, {
        title: "my milestone",
        description: "my milestone description",
        dueDate: "2020-01-01"
      });
      const feature = await service.createFeature(org.id, {
        title: "my feature",
        description: "my feature description",
        priority: Priority.HIGH,
        milestone: milestone.id,
        timeline: Timeline.THIS_QUARTER
      });
      const foundFeature = await service.getFeature(org.id, feature.id);
      expect(foundFeature.milestone).toBeDefined();
      expect(foundFeature.milestone.id).toEqual(milestone.id);
      expect(foundFeature.milestone.title).toEqual(milestone.title);
    });
  });
  describe("when updating a feature", () => {
    it("should return a feature", async () => {
      const feature = await service.createFeature(org.id, {
        title: "my feature",
        description: "my feature description",
        priority: Priority.HIGH,
        timeline: Timeline.THIS_QUARTER
      });
      const updatedFeature = await service.updateFeature(org.id, feature.id, {
        title: "my updated feature",
        description: "my updated feature description",
        priority: Priority.LOW,
        timeline: Timeline.NEXT_QUARTER
      });
      expect(updatedFeature.id).toEqual(feature.id);
      expect(updatedFeature.title).toEqual("my updated feature");
      expect(updatedFeature.description).toEqual("my updated feature description");
      expect(updatedFeature.priority).toEqual(Priority.LOW);
      expect(updatedFeature.timeline).toEqual(Timeline.NEXT_QUARTER);
      expect(updatedFeature.createdAt).toEqual(feature.createdAt);
      expect(updatedFeature.updatedAt).not.toEqual(feature.updatedAt);
    });
    it("should update the feature with a key result", async () => {
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
        timeline: Timeline.THIS_QUARTER
      });
      const updatedFeature = await service.updateFeature(org.id, feature.id, {
        title: "my updated feature",
        description: "my updated feature description",
        priority: Priority.LOW,
        keyResult: objective.keyResults[0].id,
        timeline: Timeline.NEXT_QUARTER
      });
      expect(updatedFeature.keyResult).toBeDefined();
      expect(updatedFeature.keyResult.id).toEqual(objective.keyResults[0].id);
      expect(updatedFeature.keyResult.title).toEqual(objective.keyResults[0].title);
    });
    it("should update the feature with a milestone", async () => {
      const milestone = await milestonesService.createMilestone(org.id, {
        title: "my milestone",
        description: "my milestone description",
        dueDate: "2020-01-01"
      });
      const feature = await service.createFeature(org.id, {
        title: "my feature",
        description: "my feature description",
        priority: Priority.HIGH,
        timeline: Timeline.THIS_QUARTER
      });
      const updatedFeature = await service.updateFeature(org.id, feature.id, {
        title: "my updated feature",
        description: "my updated feature description",
        priority: Priority.LOW,
        milestone: milestone.id,
        timeline: Timeline.NEXT_QUARTER
      });
      expect(updatedFeature.milestone).toBeDefined();
      expect(updatedFeature.milestone.id).toEqual(milestone.id);
      expect(updatedFeature.milestone.title).toEqual(milestone.title);
    });
  });
  describe("when deleting a feature", () => {
    it("should delete the feature", async () => {
      const feature = await service.createFeature(org.id, {
        title: "my feature",
        description: "my feature description",
        priority: Priority.HIGH,
        timeline: Timeline.THIS_QUARTER
      });
      await service.deleteFeature(org.id, feature.id);
      await expect(service.getFeature(org.id, feature.id)).rejects.toThrowError();
    });
    it("should remove the association between features and work items", async () => {
      const feature = await service.createFeature(org.id, {
        title: "my feature",
        description: "my feature description",
        priority: Priority.HIGH,
        timeline: Timeline.THIS_QUARTER
      });
      const workItem = await workItemsService.createWorkItem(org.id, {
        title: "my work item",
        description: "my work item description",
        priority: Priority.HIGH,
        type: WorkItemType.USER_STORY,
        feature: feature.id,
        status: WorkItemStatus.BACKLOG
      });
      await service.deleteFeature(org.id, feature.id);
      const foundWorkItem = await workItemsService.getWorkItem(org.id, workItem.id);
      expect(foundWorkItem.feature).toBeUndefined();
    });
  });
});
