import { WorkItemsService } from "./work-items.service";
import { UsersService } from "../../users/users.service";
import { FeaturesService } from "../../roadmap/features/features.service";
import { MilestonesService } from "../../roadmap/milestones/milestones.service";
import { OkrsService } from "../../okrs/okrs.service";
import { OrgsService } from "../../orgs/orgs.service";
import { Org } from "../../orgs/org.entity";
import { setupTestingModule } from "../../../test/test.utils";
import { getRepositoryToken, TypeOrmModule } from "@nestjs/typeorm";
import { Objective } from "../../okrs/objective.entity";
import { KeyResult } from "../../okrs/key-result.entity";
import { Feature } from "../../roadmap/features/feature.entity";
import { User } from "../../users/user.entity";
import { Milestone } from "../../roadmap/milestones/milestone.entity";
import { Priority } from "../../common/priority.enum";
import { WorkItemType } from "./work-item-type.enum";
import { EntityNotFoundError, Repository } from "typeorm";
import { WorkItemStatus } from "./work-item-status.enum";
import { FeatureStatus } from "../../roadmap/features/featurestatus.enum";
import { Iteration } from "../../iterations/Iteration.entity";
import { WorkItem } from "./work-item.entity";
import { IterationsService } from "../../iterations/iterations.service";
import { File } from "../../files/file.entity";
import { WorkItemFile } from "./work-item-file.entity";
import { FeatureFile } from "../../roadmap/features/feature-file.entity";

describe("WorkItemsService", () => {
  let usersService: UsersService;
  let orgsService: OrgsService;
  let featuresService: FeaturesService;
  let iterationService: IterationsService;
  let filesRepository: Repository<File>;
  let service: WorkItemsService;
  let org: Org;
  let user: User;

  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [TypeOrmModule.forFeature([Objective, Org, KeyResult, Feature, User, Milestone, Iteration, WorkItem, File, FeatureFile, WorkItemFile])],
      [OkrsService, OrgsService, FeaturesService, UsersService, MilestonesService, WorkItemsService, IterationsService]
    );
    cleanup = dbCleanup;
    service = module.get<WorkItemsService>(WorkItemsService);
    iterationService = module.get<IterationsService>(IterationsService);
    featuresService = module.get<FeaturesService>(FeaturesService);
    orgsService = module.get<OrgsService>(OrgsService);
    usersService = module.get<UsersService>(UsersService);
    filesRepository = module.get<Repository<File>>(getRepositoryToken(File));
    user = await usersService.create(
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
          status: FeatureStatus.PLANNED
        });
      const workItem = await service.createWorkItem(
        user.id,
        {
          title: "my work item",
          description: "my work item description",
          priority: Priority.HIGH,
          type: WorkItemType.USER_STORY,
          feature: feature.id,
          status: WorkItemStatus.PLANNED
        });
      expect(workItem).toBeDefined();
      expect(workItem.id).toBeDefined();
      expect(workItem.title).toEqual("my work item");
      expect(workItem.description).toEqual("my work item description");
      expect(workItem.priority).toEqual(Priority.HIGH);
      expect(workItem.type).toEqual(WorkItemType.USER_STORY);
      expect(workItem.feature.id).toBeDefined();
      expect(workItem.feature.title).toEqual("my feature");
      expect(workItem.createdBy.id).toEqual(user.id);
      expect(workItem.createdBy.name).toEqual(user.name);
    });
    it("should update the feature progress", async () => {
      const feature = await featuresService.createFeature(
        org.id,
        {
          title: "my feature",
          description: "my feature description",
          priority: Priority.HIGH,
          status: FeatureStatus.IN_PROGRESS
        });
      await service.createWorkItem(
        user.id,
        {
          title: "my work item",
          description: "my work item description",
          priority: Priority.HIGH,
          type: WorkItemType.USER_STORY,
          estimation: 13,
          feature: feature.id,
          status: WorkItemStatus.DONE
        });
      await service.createWorkItem(
        user.id,
        {
          title: "my other work item",
          description: "my other work item description",
          priority: Priority.MEDIUM,
          type: WorkItemType.TECHNICAL_DEBT,
          estimation: 13,
          feature: feature.id,
          status: WorkItemStatus.IN_PROGRESS
        });
      const foundFeature = await featuresService.getFeature(org.id, feature.id);
      expect(foundFeature.progress).toEqual(50);
    });
    it("should create the work item with files", async () => {
      const file1 = new File();
      file1.name = "file1";
      file1.size = 100;
      file1.type = "text/plain";
      file1.path = "/path/to/file1";
      file1.url = "https://example.com/file1";
      file1.org = Promise.resolve(org);
      const savedFile1 = await filesRepository.save(file1);
      const file2 = new File();
      file2.name = "file2";
      file2.size = 100;
      file2.type = "text/plain";
      file2.path = "/path/to/file1";
      file2.url = "https://example.com/file1";
      file2.org = Promise.resolve(org);
      const savedFile2 = await filesRepository.save(file2);
      const workItem = await service.createWorkItem(
        user.id,
        {
          title: "my work item",
          description: "my work item description",
          priority: Priority.HIGH,
          type: WorkItemType.USER_STORY,
          estimation: 13,
          status: WorkItemStatus.DONE,
          files: [
            {
              id: savedFile1.id
            },
            {
              id: savedFile2.id
            }
          ]
        });
      expect(workItem).toBeDefined();
      expect(workItem.id).toBeDefined();
      expect(workItem.title).toEqual("my work item");
      expect(workItem.description).toEqual("my work item description");
      expect(workItem.priority).toEqual(Priority.HIGH);
      expect(workItem.type).toEqual(WorkItemType.USER_STORY);
      expect(workItem.estimation).toEqual(13);
      expect(workItem.status).toEqual(WorkItemStatus.DONE);
      expect(workItem.files).toBeDefined();
      expect(workItem.files.length).toEqual(2);
      expect(workItem.files[0].id).toEqual(savedFile1.id);
      expect(workItem.files[1].id).toEqual(savedFile2.id);
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
          status: FeatureStatus.PLANNED
        });
      await service.createWorkItem(
        user.id,
        {
          title: "my work item",
          description: "my work item description",
          priority: Priority.HIGH,
          type: WorkItemType.USER_STORY,
          feature: feature.id,
          status: WorkItemStatus.PLANNED
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
          status: FeatureStatus.PLANNED
        });
      const workItem = await service.createWorkItem(
        user.id,
        {
          title: "my work item",
          description: "my work item description",
          priority: Priority.HIGH,
          type: WorkItemType.USER_STORY,
          feature: feature.id,
          status: WorkItemStatus.PLANNED
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
          status: FeatureStatus.PLANNED
        });
      const feature2 = await featuresService.createFeature(
        org.id,
        {
          title: "my other feature",
          description: "my other feature description",
          priority: Priority.MEDIUM,
          status: FeatureStatus.PLANNED
        });
      const workItem = await service.createWorkItem(
        user.id,
        {
          title: "my work item",
          description: "my work item description",
          priority: Priority.HIGH,
          type: WorkItemType.USER_STORY,
          feature: feature1.id,
          status: WorkItemStatus.PLANNED
        });
      const foundWorkItem = await service.updateWorkItem(org.id, workItem.id, {
        title: "my work item updated",
        description: "my work item description updated",
        priority: Priority.MEDIUM,
        type: WorkItemType.TECHNICAL_DEBT,
        feature: feature2.id,
        status: WorkItemStatus.PLANNED
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
          status: FeatureStatus.PLANNED
        });
      const workItem = await service.createWorkItem(
        user.id,
        {
          title: "my work item",
          description: "my work item description",
          priority: Priority.HIGH,
          type: WorkItemType.USER_STORY,
          feature: feature.id,
          status: WorkItemStatus.PLANNED
        });
      const foundWorkItem = await service.updateWorkItem(org.id, workItem.id, {
        title: "my work item updated",
        description: "my work item description updated",
        priority: Priority.MEDIUM,
        type: WorkItemType.TECHNICAL_DEBT,
        status: WorkItemStatus.PLANNED
      });
      expect(foundWorkItem).toBeDefined();
      expect(foundWorkItem.title).toEqual("my work item updated");
      expect(foundWorkItem.description).toEqual("my work item description updated");
      expect(foundWorkItem.priority).toEqual(Priority.MEDIUM);
      expect(foundWorkItem.type).toEqual(WorkItemType.TECHNICAL_DEBT);
      expect(foundWorkItem.feature).toBeUndefined();
    });
    it("should update the completedAt field if the status is DONE", async () => {
      const workItem = await service.createWorkItem(
        user.id,
        {
          title: "my work item",
          description: "my work item description",
          priority: Priority.HIGH,
          type: WorkItemType.USER_STORY,
          status: WorkItemStatus.PLANNED
        });
      const foundWorkItem = await service.updateWorkItem(org.id, workItem.id, {
        title: "my work item updated",
        description: "my work item description updated",
        priority: Priority.MEDIUM,
        type: WorkItemType.TECHNICAL_DEBT,
        status: WorkItemStatus.DONE
      });
      expect(foundWorkItem).toBeDefined();
      expect(foundWorkItem.title).toEqual("my work item updated");
      expect(foundWorkItem.description).toEqual("my work item description updated");
      expect(foundWorkItem.priority).toEqual(Priority.MEDIUM);
      expect(foundWorkItem.type).toEqual(WorkItemType.TECHNICAL_DEBT);
      expect(foundWorkItem.completedAt).toBeDefined();
    });
    it("should update the completedAt field if the status is CLOSED", async () => {
      const workItem = await service.createWorkItem(
        user.id,
        {
          title: "my work item",
          description: "my work item description",
          priority: Priority.HIGH,
          type: WorkItemType.USER_STORY,
          status: WorkItemStatus.PLANNED
        });
      const foundWorkItem = await service.updateWorkItem(org.id, workItem.id, {
        title: "my work item updated",
        description: "my work item description updated",
        priority: Priority.MEDIUM,
        type: WorkItemType.TECHNICAL_DEBT,
        status: WorkItemStatus.CLOSED
      });
      expect(foundWorkItem).toBeDefined();
      expect(foundWorkItem.title).toEqual("my work item updated");
      expect(foundWorkItem.description).toEqual("my work item description updated");
      expect(foundWorkItem.priority).toEqual(Priority.MEDIUM);
      expect(foundWorkItem.type).toEqual(WorkItemType.TECHNICAL_DEBT);
      expect(foundWorkItem.completedAt).toBeDefined();
    });
    it("should update the work item files", async () => {
      const file1 = new File();
      file1.name = "file1";
      file1.size = 100;
      file1.type = "text/plain";
      file1.path = "/path/to/file1";
      file1.url = "https://example.com/file1";
      file1.org = Promise.resolve(org);
      const savedFile1 = await filesRepository.save(file1);
      const file2 = new File();
      file2.name = "file2";
      file2.size = 100;
      file2.type = "text/plain";
      file2.path = "/path/to/file1";
      file2.url = "https://example.com/file1";
      file2.org = Promise.resolve(org);
      const savedFile2 = await filesRepository.save(file2);
      const workItem = await service.createWorkItem(
        user.id,
        {
          title: "my work item",
          description: "my work item description",
          priority: Priority.HIGH,
          type: WorkItemType.USER_STORY,
          estimation: 13,
          status: WorkItemStatus.DONE,
          files: [
            {
              id: savedFile1.id
            },
            {
              id: savedFile2.id
            }
          ]
        });
      const foundWorkItem = await service.updateWorkItem(org.id, workItem.id, {
        title: "my work item updated",
        description: "my work item description updated",
        priority: Priority.MEDIUM,
        type: WorkItemType.TECHNICAL_DEBT,
        estimation: 13,
        status: WorkItemStatus.DONE,
        files: [
          {
            id: savedFile1.id
          }
        ]
      });
      expect(foundWorkItem).toBeDefined();
      expect(foundWorkItem.title).toEqual("my work item updated");
      expect(foundWorkItem.description).toEqual("my work item description updated");
      expect(foundWorkItem.priority).toEqual(Priority.MEDIUM);
      expect(foundWorkItem.type).toEqual(WorkItemType.TECHNICAL_DEBT);
      expect(foundWorkItem.estimation).toEqual(13);
      expect(foundWorkItem.status).toEqual(WorkItemStatus.DONE);
      expect(foundWorkItem.files).toBeDefined();
      expect(foundWorkItem.files.length).toEqual(1);
      expect(foundWorkItem.files[0].id).toEqual(savedFile1.id);
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
          status: FeatureStatus.PLANNED
        });
      const workItem = await service.createWorkItem(
        user.id,
        {
          title: "my work item",
          description: "my work item description",
          priority: Priority.HIGH,
          type: WorkItemType.USER_STORY,
          feature: feature.id,
          status: WorkItemStatus.PLANNED
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
          status: FeatureStatus.PLANNED
        });
      const feature2 = await featuresService.createFeature(
        org.id,
        {
          title: "my other feature",
          description: "my other feature description",
          priority: Priority.MEDIUM,
          status: FeatureStatus.PLANNED
        });
      await service.createWorkItem(
        user.id,
        {
          title: "my work item",
          description: "my work item description",
          priority: Priority.HIGH,
          type: WorkItemType.USER_STORY,
          feature: feature1.id,
          status: WorkItemStatus.PLANNED
        });
      await service.createWorkItem(
        user.id,
        {
          title: "my other work item",
          description: "my other work item description",
          priority: Priority.MEDIUM,
          type: WorkItemType.TECHNICAL_DEBT,
          feature: feature2.id,
          status: WorkItemStatus.PLANNED
        });
      const workItems = await service.listOpenWorkItemsWithoutIterations(org.id);
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
    it("should return the open work items that are not associated with an iteration", async () => {
      const iteration = await iterationService.create(org.id, {
        goal: "my iteration description",
        startDate: "2020-01-01",
        duration: 7
      });
      const feature1 = await featuresService.createFeature(
        org.id,
        {
          title: "my feature",
          description: "my feature description",
          priority: Priority.HIGH,
          status: FeatureStatus.PLANNED
        });
      const feature2 = await featuresService.createFeature(
        org.id,
        {
          title: "my other feature",
          description: "my other feature description",
          priority: Priority.MEDIUM,
          status: FeatureStatus.PLANNED
        });
      await service.createWorkItem(
        user.id,
        {
          title: "my work item",
          description: "my work item description",
          priority: Priority.HIGH,
          type: WorkItemType.USER_STORY,
          feature: feature1.id,
          status: WorkItemStatus.PLANNED,
          iteration: iteration.id
        });
      await service.createWorkItem(
        user.id,
        {
          title: "my other work item",
          description: "my other work item description",
          priority: Priority.MEDIUM,
          type: WorkItemType.TECHNICAL_DEBT,
          feature: feature2.id,
          status: WorkItemStatus.PLANNED
        });
      const workItems = await service.listOpenWorkItemsWithoutIterations(org.id);
      expect(workItems).toBeDefined();
      expect(workItems.length).toEqual(1);
      expect(workItems[0].title).toEqual("my other work item");
      expect(workItems[0].description).toEqual("my other work item description");
      expect(workItems[0].priority).toEqual(Priority.MEDIUM);
      expect(workItems[0].type).toEqual(WorkItemType.TECHNICAL_DEBT);
      expect(workItems[0].feature.id).toBeDefined();
      expect(workItems[0].feature.title).toEqual("my other feature");
    });
  });
  describe("when creating a work item with a feature", () => {
    it("should update the feature progress", async () => {
      const feature = await featuresService.createFeature(
        org.id,
        {
          title: "my feature",
          description: "my feature description",
          priority: Priority.HIGH,
          status: FeatureStatus.IN_PROGRESS
        });
      await service.createWorkItem(
        user.id,
        {
          title: "my work item",
          description: "my work item description",
          priority: Priority.HIGH,
          type: WorkItemType.USER_STORY,
          feature: feature.id,
          estimation: 13,
          status: WorkItemStatus.DONE
        });
      await service.createWorkItem(
        user.id,
        {
          title: "my other work item",
          description: "my other work item description",
          priority: Priority.MEDIUM,
          type: WorkItemType.TECHNICAL_DEBT,
          feature: feature.id,
          estimation: 13,
          status: WorkItemStatus.IN_PROGRESS
        });
      const foundFeature = await featuresService.getFeature(org.id, feature.id);
      expect(foundFeature.progress).toEqual(50);
    });
    it("should update the feature workItemsCount", async () => {
      const feature = await featuresService.createFeature(
        org.id,
        {
          title: "my feature",
          description: "my feature description",
          priority: Priority.HIGH,
          status: FeatureStatus.IN_PROGRESS
        });
      await service.createWorkItem(
        user.id,
        {
          title: "my work item",
          description: "my work item description",
          priority: Priority.HIGH,
          type: WorkItemType.USER_STORY,
          feature: feature.id,
          estimation: 13,
          status: WorkItemStatus.DONE
        });
      await service.createWorkItem(
        user.id,
        {
          title: "my other work item",
          description: "my other work item description",
          priority: Priority.MEDIUM,
          type: WorkItemType.TECHNICAL_DEBT,
          feature: feature.id,
          estimation: 13,
          status: WorkItemStatus.IN_PROGRESS
        });
      const foundFeature = await featuresService.getFeature(org.id, feature.id);
      expect(foundFeature.workItemsCount).toEqual(2);
    });
  });
  describe("when updating a work item with a feature", () => {
    it("should update the feature progress", async () => {
      const feature = await featuresService.createFeature(
        org.id,
        {
          title: "my feature",
          description: "my feature description",
          priority: Priority.HIGH,
          status: FeatureStatus.IN_PROGRESS
        });
      const workItem1 = await service.createWorkItem(
        user.id,
        {
          title: "my work item",
          description: "my work item description",
          priority: Priority.HIGH,
          type: WorkItemType.USER_STORY,
          estimation: 13,
          feature: feature.id,
          status: WorkItemStatus.DONE
        });
      const workItem2 = await service.createWorkItem(
        user.id,
        {
          title: "my other work item",
          description: "my other work item description",
          priority: Priority.MEDIUM,
          type: WorkItemType.TECHNICAL_DEBT,
          estimation: 13,
          status: WorkItemStatus.IN_PROGRESS
        });
      await service.updateWorkItem(org.id, workItem1.id, {
        title: "my work item",
        description: "my work item description",
        priority: Priority.HIGH,
        type: WorkItemType.USER_STORY,
        estimation: 13,
        status: WorkItemStatus.DONE,
        feature: feature.id
      });
      await service.updateWorkItem(org.id, workItem2.id, {
        title: "my other work item",
        description: "my other work item description",
        priority: Priority.MEDIUM,
        type: WorkItemType.TECHNICAL_DEBT,
        estimation: 13,
        status: WorkItemStatus.IN_PROGRESS,
        feature: feature.id
      });
      const foundFeature = await featuresService.getFeature(org.id, feature.id);
      expect(foundFeature.progress).toEqual(50);
    });
    it("should update the feature workItemsCount", async () => {
      const feature = await featuresService.createFeature(
        org.id,
        {
          title: "my feature",
          description: "my feature description",
          priority: Priority.HIGH,
          status: FeatureStatus.IN_PROGRESS
        });
      const workItem1 = await service.createWorkItem(
        user.id,
        {
          title: "my work item",
          description: "my work item description",
          priority: Priority.HIGH,
          type: WorkItemType.USER_STORY,
          estimation: 13,
          feature: feature.id,
          status: WorkItemStatus.DONE
        });
      const workItem2 = await service.createWorkItem(
        user.id,
        {
          title: "my other work item",
          description: "my other work item description",
          priority: Priority.MEDIUM,
          type: WorkItemType.TECHNICAL_DEBT,
          estimation: 13,
          feature: feature.id,
          status: WorkItemStatus.IN_PROGRESS
        });
      await service.updateWorkItem(org.id, workItem1.id, {
        title: "my work item",
        description: "my work item description",
        priority: Priority.HIGH,
        type: WorkItemType.USER_STORY,
        estimation: 13,
        status: WorkItemStatus.DONE,
        feature: feature.id
      });
      await service.updateWorkItem(org.id, workItem2.id, {
        title: "my other work item",
        description: "my other work item description",
        priority: Priority.MEDIUM,
        type: WorkItemType.TECHNICAL_DEBT,
        estimation: 13,
        status: WorkItemStatus.IN_PROGRESS,
        feature: null
      });
      const foundFeature = await featuresService.getFeature(org.id, feature.id);
      expect(foundFeature.workItemsCount).toEqual(1);
    });
    it("should update the feature progress and count when changing the feature of a work item", async () => {
      const feature1 = await featuresService.createFeature(
        org.id,
        {
          title: "my feature 1",
          description: "my feature description 1",
          priority: Priority.HIGH,
          status: FeatureStatus.IN_PROGRESS
        });
      const feature2 = await featuresService.createFeature(
        org.id,
        {
          title: "my feature 2",
          description: "my feature description 2",
          priority: Priority.HIGH,
          status: FeatureStatus.IN_PROGRESS
        });
      const workItem1 = await service.createWorkItem(
        user.id,
        {
          title: "my work item 1",
          description: "my work item description 1",
          priority: Priority.HIGH,
          type: WorkItemType.USER_STORY,
          estimation: 13,
          feature: feature1.id,
          status: WorkItemStatus.DONE
        });
      const workItem2 = await service.createWorkItem(
        user.id,
        {
          title: "my work item 2",
          description: "my work item description 2",
          priority: Priority.MEDIUM,
          type: WorkItemType.TECHNICAL_DEBT,
          estimation: 13,
          feature: feature2.id,
          status: WorkItemStatus.IN_PROGRESS
        });
      await service.updateWorkItem(org.id, workItem1.id, {
        title: "my work item 1",
        description: "my work item description 1",
        priority: Priority.HIGH,
        type: WorkItemType.USER_STORY,
        estimation: 13,
        status: WorkItemStatus.DONE,
        feature: feature2.id
      });
      await service.updateWorkItem(org.id, workItem2.id, {
        title: "my work item 2",
        description: "my work item description 2",
        priority: Priority.MEDIUM,
        type: WorkItemType.TECHNICAL_DEBT,
        estimation: 13,
        status: WorkItemStatus.IN_PROGRESS,
        feature: feature2.id
      });
      const foundFeature1 = await featuresService.getFeature(org.id, feature1.id);
      expect(foundFeature1.progress).toEqual(0);
      expect(foundFeature1.workItemsCount).toEqual(0);
      const foundFeature2 = await featuresService.getFeature(org.id, feature2.id);
      expect(foundFeature2.progress).toEqual(50);
      expect(foundFeature2.workItemsCount).toEqual(2);
    });
  });
  describe("when deleting a work item with a feature", () => {
    it("should update the feature progress", async () => {
      const feature = await featuresService.createFeature(
        org.id,
        {
          title: "my feature",
          description: "my feature description",
          priority: Priority.HIGH,
          status: FeatureStatus.IN_PROGRESS
        });
      const workItem1 = await service.createWorkItem(
        user.id,
        {
          title: "my work item",
          description: "my work item description",
          priority: Priority.HIGH,
          type: WorkItemType.USER_STORY,
          estimation: 13,
          feature: feature.id,
          status: WorkItemStatus.DONE
        });
      const workItem2 = await service.createWorkItem(
        user.id,
        {
          title: "my other work item",
          description: "my other work item description",
          priority: Priority.MEDIUM,
          type: WorkItemType.TECHNICAL_DEBT,
          estimation: 13,
          feature: feature.id,
          status: WorkItemStatus.IN_PROGRESS
        });
      await service.deleteWorkItem(org.id, workItem1.id);
      await service.deleteWorkItem(org.id, workItem2.id);
      const foundFeature = await featuresService.getFeature(org.id, feature.id);
      expect(foundFeature.progress).toEqual(0);
    });
    it("should update the feature workItemsCount", async () => {
      const feature = await featuresService.createFeature(
        org.id,
        {
          title: "my feature",
          description: "my feature description",
          priority: Priority.HIGH,
          status: FeatureStatus.IN_PROGRESS
        });
      const workItem1 = await service.createWorkItem(
        user.id,
        {
          title: "my work item",
          description: "my work item description",
          priority: Priority.HIGH,
          type: WorkItemType.USER_STORY,
          estimation: 13,
          feature: feature.id,
          status: WorkItemStatus.DONE
        });
      const workItem2 = await service.createWorkItem(
        user.id,
        {
          title: "my other work item",
          description: "my other work item description",
          priority: Priority.MEDIUM,
          type: WorkItemType.TECHNICAL_DEBT,
          estimation: 13,
          feature: feature.id,
          status: WorkItemStatus.IN_PROGRESS
        });
      await service.deleteWorkItem(org.id, workItem1.id);
      await service.deleteWorkItem(org.id, workItem2.id);
      const foundFeature = await featuresService.getFeature(org.id, feature.id);
      expect(foundFeature.workItemsCount).toEqual(0);
    });
  });
  describe("when closing a work item", () => {
    it("should update the feature progress", async () => {
      const feature = await featuresService.createFeature(
        org.id,
        {
          title: "my feature",
          description: "my feature description",
          priority: Priority.MEDIUM,
          status: FeatureStatus.IN_PROGRESS
        });
      await service.createWorkItem(
        user.id,
        {
          title: "my work item 1",
          description: "my work item description 1",
          priority: Priority.HIGH,
          type: WorkItemType.USER_STORY,
          estimation: 13,
          feature: feature.id,
          status: WorkItemStatus.DONE
        });
      const workItem2 = await service.createWorkItem(
        user.id,
        {
          title: "my work item 2",
          description: "my work item description 2",
          priority: Priority.MEDIUM,
          type: WorkItemType.TECHNICAL_DEBT,
          estimation: 13,
          feature: feature.id,
          status: WorkItemStatus.IN_PROGRESS
        });
      await service.updateWorkItem(org.id, workItem2.id, {
        title: "my work item 2",
        description: "my work item description 2",
        priority: Priority.MEDIUM,
        type: WorkItemType.TECHNICAL_DEBT,
        estimation: 13,
        feature: feature.id,
        status: WorkItemStatus.CLOSED
      });
      const foundFeature = await featuresService.getFeature(org.id, feature.id);
      expect(foundFeature.progress).toEqual(100);
    });
  });
  describe("when patching a work item", () => {
    it("should allow to patch the iteration", async () => {
      await iterationService.create(org.id, {
        goal: "my iteration description",
        startDate: "2020-01-01",
        duration: 7
      });
      const iteration2 = await iterationService.create(org.id, {
        goal: "my iteration description",
        startDate: "2020-01-01",
        duration: 7
      });
      const workItem = await service.createWorkItem(
        user.id,
        {
          title: "my work item 1",
          description: "my work item description 1",
          priority: Priority.HIGH,
          type: WorkItemType.USER_STORY,
          estimation: 13,
          status: WorkItemStatus.DONE
        });
      await service.patchWorkItem(org.id, workItem.id, {
        iteration: iteration2.id
      });
      const foundWorkItem = await service.getWorkItem(org.id, workItem.id);
      expect(foundWorkItem.iteration.id).toEqual(iteration2.id);
    });
    it("should allow to patch the status", async () => {
      const workItem = await service.createWorkItem(
        user.id,
        {
          title: "my work item 1",
          description: "my work item description 1",
          priority: Priority.HIGH,
          type: WorkItemType.USER_STORY,
          estimation: 13,
          status: WorkItemStatus.DONE
        });
      await service.patchWorkItem(org.id, workItem.id, {
        status: WorkItemStatus.IN_PROGRESS
      });
      const foundWorkItem = await service.getWorkItem(org.id, workItem.id);
      expect(foundWorkItem.status).toEqual(WorkItemStatus.IN_PROGRESS);
    });
    it("should update the feature progress when changing the status to DONE", async () => {
      const feature = await featuresService.createFeature(
        org.id,
        {
          title: "my feature",
          description: "my feature description",
          status: FeatureStatus.IN_PROGRESS,
          priority: Priority.LOW
        });
      const workItem = await service.createWorkItem(
        user.id,
        {
          title: "my work item 1",
          description: "my work item description 1",
          priority: Priority.HIGH,
          type: WorkItemType.USER_STORY,
          estimation: 13,
          feature: feature.id,
          status: WorkItemStatus.IN_PROGRESS
        });
      await service.patchWorkItem(org.id, workItem.id, {
        status: WorkItemStatus.DONE
      });
      const foundFeature = await featuresService.getFeature(org.id, feature.id);
      expect(foundFeature.progress).toEqual(100);
    });
    it("should update the feature progress when changing the status to CLOSED", async () => {
      const feature = await featuresService.createFeature(
        org.id,
        {
          title: "my feature",
          description: "my feature description",
          status: FeatureStatus.IN_PROGRESS,
          priority: Priority.LOW
        });
      const workItem = await service.createWorkItem(
        user.id,
        {
          title: "my work item 1",
          description: "my work item description 1",
          priority: Priority.HIGH,
          type: WorkItemType.USER_STORY,
          estimation: 13,
          feature: feature.id,
          status: WorkItemStatus.IN_PROGRESS
        });
      await service.patchWorkItem(org.id, workItem.id, {
        status: WorkItemStatus.CLOSED
      });
      const foundFeature = await featuresService.getFeature(org.id, feature.id);
      expect(foundFeature.progress).toEqual(100);
    });
    it("should update the feature progress when changing the status to IN_PROGRESS", async () => {
      const feature = await featuresService.createFeature(
        org.id,
        {
          title: "my feature",
          description: "my feature description",
          status: FeatureStatus.IN_PROGRESS,
          priority: Priority.LOW
        });
      const workItem = await service.createWorkItem(
        user.id,
        {
          title: "my work item 1",
          description: "my work item description 1",
          priority: Priority.HIGH,
          type: WorkItemType.USER_STORY,
          estimation: 13,
          feature: feature.id,
          status: WorkItemStatus.DONE
        });
      await service.patchWorkItem(org.id, workItem.id, {
        status: WorkItemStatus.IN_PROGRESS
      });
      const foundFeature = await featuresService.getFeature(org.id, feature.id);
      expect(foundFeature.progress).toEqual(0);
    });
    it("should update the work item priority", async () => {
      const workItem = await service.createWorkItem(
        user.id,
        {
          title: "my work item 1",
          description: "my work item description 1",
          priority: Priority.HIGH,
          type: WorkItemType.USER_STORY,
          estimation: 13,
          status: WorkItemStatus.DONE
        });
      await service.patchWorkItem(org.id, workItem.id, {
        priority: Priority.LOW
      });
      const foundWorkItem = await service.getWorkItem(org.id, workItem.id);
      expect(foundWorkItem.priority).toEqual(Priority.LOW);
    });
  });
});
