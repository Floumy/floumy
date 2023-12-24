import { WorkItemsService } from "./work-items.service";
import { UsersService } from "../../users/users.service";
import { FeaturesService } from "../../roadmap/features/features.service";
import { MilestonesService } from "../../roadmap/milestones/milestones.service";
import { OkrsService } from "../../okrs/okrs.service";
import { OrgsService } from "../../orgs/orgs.service";
import { Org } from "../../orgs/org.entity";
import { setupTestingModule } from "../../../test/test.utils";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Objective } from "../../okrs/objective.entity";
import { KeyResult } from "../../okrs/key-result.entity";
import { Feature } from "../../roadmap/features/feature.entity";
import { User } from "../../users/user.entity";
import { Milestone } from "../../roadmap/milestones/milestone.entity";
import { Priority } from "../../common/priority.enum";
import { Timeline } from "../../common/timeline.enum";
import { WorkItemType } from "./work-item-type.enum";
import { EntityNotFoundError } from "typeorm";
import { WorkItemStatus } from "./work-item-status.enum";
import { FeatureStatus } from "../../roadmap/features/featurestatus.enum";
import { Iteration } from "../../iterations/Iteration.entity";

describe("WorkItemsService", () => {
  let usersService: UsersService;
  let orgsService: OrgsService;
  let featuresService: FeaturesService;
  let service: WorkItemsService;
  let org: Org;

  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [TypeOrmModule.forFeature([Objective, Org, KeyResult, Feature, User, Milestone, Iteration])],
      [OkrsService, OrgsService, FeaturesService, UsersService, MilestonesService, WorkItemsService]
    );
    cleanup = dbCleanup;
    service = module.get<WorkItemsService>(WorkItemsService);
    featuresService = module.get<FeaturesService>(FeaturesService);
    orgsService = module.get<OrgsService>(OrgsService);
    usersService = module.get<UsersService>(UsersService);
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

  describe("when creating a work item", () => {
    it("should return the created work item", async () => {
      const feature = await featuresService.createFeature(
        org.id,
        {
          title: "my feature",
          description: "my feature description",
          priority: Priority.HIGH,
          timeline: Timeline.NEXT_QUARTER,
          status: FeatureStatus.PLANNED
        });
      const workItem = await service.createWorkItem(
        org.id,
        {
          title: "my work item",
          description: "my work item description",
          priority: Priority.HIGH,
          type: WorkItemType.USER_STORY,
          feature: feature.id,
          status: WorkItemStatus.BACKLOG
        });
      expect(workItem).toBeDefined();
      expect(workItem.id).toBeDefined();
      expect(workItem.title).toEqual("my work item");
      expect(workItem.description).toEqual("my work item description");
      expect(workItem.priority).toEqual(Priority.HIGH);
      expect(workItem.type).toEqual(WorkItemType.USER_STORY);
      expect(workItem.feature.id).toBeDefined();
      expect(workItem.feature.title).toEqual("my feature");
    });
  });
  describe("when listing work items", () => {
    it("should return the list of work items", async () => {
      const feature = await featuresService.createFeature(
        org.id,
        {
          title: "my feature",
          description: "my feature description",
          priority: Priority.HIGH,
          timeline: Timeline.NEXT_QUARTER,
          status: FeatureStatus.PLANNED
        });
      await service.createWorkItem(
        org.id,
        {
          title: "my work item",
          description: "my work item description",
          priority: Priority.HIGH,
          type: WorkItemType.USER_STORY,
          feature: feature.id,
          status: WorkItemStatus.BACKLOG
        });
      const workItems = await service.listWorkItems(org.id);
      expect(workItems).toBeDefined();
      expect(workItems.length).toEqual(1);
      expect(workItems[0].title).toEqual("my work item");
      expect(workItems[0].description).toEqual("my work item description");
      expect(workItems[0].priority).toEqual(Priority.HIGH);
      expect(workItems[0].type).toEqual(WorkItemType.USER_STORY);
      expect(workItems[0].feature.id).toBeDefined();
      expect(workItems[0].feature.title).toEqual("my feature");
    });
  });
  describe("when getting a work item", () => {
    it("should return the work item", async () => {
      const feature = await featuresService.createFeature(
        org.id,
        {
          title: "my feature",
          description: "my feature description",
          priority: Priority.HIGH,
          timeline: Timeline.NEXT_QUARTER,
          status: FeatureStatus.PLANNED
        });
      const workItem = await service.createWorkItem(
        org.id,
        {
          title: "my work item",
          description: "my work item description",
          priority: Priority.HIGH,
          type: WorkItemType.USER_STORY,
          feature: feature.id,
          status: WorkItemStatus.BACKLOG
        });
      const foundWorkItem = await service.getWorkItem(org.id, workItem.id);
      expect(foundWorkItem).toBeDefined();
      expect(foundWorkItem.title).toEqual("my work item");
      expect(foundWorkItem.description).toEqual("my work item description");
      expect(foundWorkItem.priority).toEqual(Priority.HIGH);
      expect(foundWorkItem.type).toEqual(WorkItemType.USER_STORY);
      expect(foundWorkItem.feature.id).toBeDefined();
      expect(foundWorkItem.feature.title).toEqual("my feature");
    });
  });
  describe("when updating a work item", () => {
    it("should return the updated work item", async () => {
      const feature1 = await featuresService.createFeature(
        org.id,
        {
          title: "my feature",
          description: "my feature description",
          priority: Priority.HIGH,
          timeline: Timeline.NEXT_QUARTER,
          status: FeatureStatus.PLANNED
        });
      const feature2 = await featuresService.createFeature(
        org.id,
        {
          title: "my other feature",
          description: "my other feature description",
          priority: Priority.MEDIUM,
          timeline: Timeline.THIS_QUARTER,
          status: FeatureStatus.PLANNED
        });
      const workItem = await service.createWorkItem(
        org.id,
        {
          title: "my work item",
          description: "my work item description",
          priority: Priority.HIGH,
          type: WorkItemType.USER_STORY,
          feature: feature1.id,
          status: WorkItemStatus.BACKLOG
        });
      const foundWorkItem = await service.updateWorkItem(org.id, workItem.id, {
        title: "my work item updated",
        description: "my work item description updated",
        priority: Priority.MEDIUM,
        type: WorkItemType.TECHNICAL_DEBT,
        feature: feature2.id,
        status: WorkItemStatus.BACKLOG
      });
      expect(foundWorkItem).toBeDefined();
      expect(foundWorkItem.title).toEqual("my work item updated");
      expect(foundWorkItem.description).toEqual("my work item description updated");
      expect(foundWorkItem.priority).toEqual(Priority.MEDIUM);
      expect(foundWorkItem.type).toEqual(WorkItemType.TECHNICAL_DEBT);
      expect(foundWorkItem.feature.id).toBeDefined();
      expect(foundWorkItem.feature.title).toEqual("my other feature");
    });
    it("should remove the association with the feature if the feature is not provided", async () => {
      const feature = await featuresService.createFeature(
        org.id,
        {
          title: "my feature",
          description: "my feature description",
          priority: Priority.HIGH,
          timeline: Timeline.NEXT_QUARTER,
          status: FeatureStatus.PLANNED
        });
      const workItem = await service.createWorkItem(
        org.id,
        {
          title: "my work item",
          description: "my work item description",
          priority: Priority.HIGH,
          type: WorkItemType.USER_STORY,
          feature: feature.id,
          status: WorkItemStatus.BACKLOG
        });
      const foundWorkItem = await service.updateWorkItem(org.id, workItem.id, {
        title: "my work item updated",
        description: "my work item description updated",
        priority: Priority.MEDIUM,
        type: WorkItemType.TECHNICAL_DEBT,
        status: WorkItemStatus.BACKLOG
      });
      expect(foundWorkItem).toBeDefined();
      expect(foundWorkItem.title).toEqual("my work item updated");
      expect(foundWorkItem.description).toEqual("my work item description updated");
      expect(foundWorkItem.priority).toEqual(Priority.MEDIUM);
      expect(foundWorkItem.type).toEqual(WorkItemType.TECHNICAL_DEBT);
      expect(foundWorkItem.feature).toBeUndefined();
    });
  });
  describe("when deleting a work item", () => {
    it("should delete the work item", async () => {
      const feature = await featuresService.createFeature(
        org.id,
        {
          title: "my feature",
          description: "my feature description",
          priority: Priority.HIGH,
          timeline: Timeline.NEXT_QUARTER,
          status: FeatureStatus.PLANNED
        });
      const workItem = await service.createWorkItem(
        org.id,
        {
          title: "my work item",
          description: "my work item description",
          priority: Priority.HIGH,
          type: WorkItemType.USER_STORY,
          feature: feature.id,
          status: WorkItemStatus.BACKLOG
        });
      await service.deleteWorkItem(org.id, workItem.id);
      expect(service.getWorkItem(org.id, workItem.id)).rejects.toThrow(EntityNotFoundError);
    });
  });
  describe("when listing open work items", () => {
    it("should return the list of open work items", async () => {
      const feature1 = await featuresService.createFeature(
        org.id,
        {
          title: "my feature",
          description: "my feature description",
          priority: Priority.HIGH,
          timeline: Timeline.NEXT_QUARTER,
          status: FeatureStatus.PLANNED
        });
      const feature2 = await featuresService.createFeature(
        org.id,
        {
          title: "my other feature",
          description: "my other feature description",
          priority: Priority.MEDIUM,
          timeline: Timeline.THIS_QUARTER,
          status: FeatureStatus.PLANNED
        });
      await service.createWorkItem(
        org.id,
        {
          title: "my work item",
          description: "my work item description",
          priority: Priority.HIGH,
          type: WorkItemType.USER_STORY,
          feature: feature1.id,
          status: WorkItemStatus.BACKLOG
        });
      await service.createWorkItem(
        org.id,
        {
          title: "my other work item",
          description: "my other work item description",
          priority: Priority.MEDIUM,
          type: WorkItemType.TECHNICAL_DEBT,
          feature: feature2.id,
          status: WorkItemStatus.BACKLOG
        });
      const workItems = await service.listOpenWorkItems(org.id);
      expect(workItems).toBeDefined();
      expect(workItems.length).toEqual(2);
      expect(workItems[0].title).toEqual("my work item");
      expect(workItems[0].description).toEqual("my work item description");
      expect(workItems[0].priority).toEqual(Priority.HIGH);
      expect(workItems[0].type).toEqual(WorkItemType.USER_STORY);
      expect(workItems[0].feature.id).toBeDefined();
      expect(workItems[0].feature.title).toEqual("my feature");
      expect(workItems[1].title).toEqual("my other work item");
      expect(workItems[1].description).toEqual("my other work item description");
      expect(workItems[1].priority).toEqual(Priority.MEDIUM);
      expect(workItems[1].type).toEqual(WorkItemType.TECHNICAL_DEBT);
      expect(workItems[1].feature.id).toBeDefined();
      expect(workItems[1].feature.title).toEqual("my other feature");
    });
  });
});
