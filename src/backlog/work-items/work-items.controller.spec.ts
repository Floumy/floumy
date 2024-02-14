import { WorkItemsController } from "./work-items.controller";
import { Org } from "../../orgs/org.entity";
import { setupTestingModule } from "../../../test/test.utils";
import { getRepositoryToken, TypeOrmModule } from "@nestjs/typeorm";
import { Feature } from "../../roadmap/features/feature.entity";
import { UsersModule } from "../../users/users.module";
import { OrgsService } from "../../orgs/orgs.service";
import { TokensService } from "../../auth/tokens.service";
import { FeaturesService } from "../../roadmap/features/features.service";
import { UsersService } from "../../users/users.service";
import { WorkItem } from "./work-item.entity";
import { Priority } from "../../common/priority.enum";
import { WorkItemType } from "./work-item-type.enum";
import { Objective } from "../../okrs/objective.entity";
import { KeyResult } from "../../okrs/key-result.entity";
import { OkrsService } from "../../okrs/okrs.service";
import { Milestone } from "../../roadmap/milestones/milestone.entity";
import { MilestonesService } from "../../roadmap/milestones/milestones.service";
import { WorkItemsService } from "./work-items.service";
import { WorkItemStatus } from "./work-item-status.enum";
import { FeatureStatus } from "../../roadmap/features/featurestatus.enum";
import { Iteration } from "../../iterations/Iteration.entity";
import { IterationsService } from "../../iterations/iterations.service";
import { File } from "../../files/file.entity";
import { Repository } from "typeorm";
import { WorkItemFile } from "./work-item-file.entity";
import { FeatureFile } from "../../roadmap/features/feature-file.entity";
import { User } from "../../users/user.entity";

describe("WorkItemsController", () => {
  let controller: WorkItemsController;
  let cleanup: () => Promise<void>;
  let org: Org;
  let user: User;
  let featureService: FeaturesService;
  let iterationsService: IterationsService;
  let fileRepository: Repository<File>;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [TypeOrmModule.forFeature([Org, Objective, KeyResult, Feature, WorkItem, Milestone, Iteration, File, FeatureFile, WorkItemFile]), UsersModule],
      [OkrsService, OrgsService, TokensService, FeaturesService, MilestonesService, WorkItemsService, IterationsService],
      [WorkItemsController]
    );
    cleanup = dbCleanup;
    controller = module.get<WorkItemsController>(WorkItemsController);
    const orgsService = module.get<OrgsService>(OrgsService);
    const usersService = module.get<UsersService>(UsersService);
    user = await usersService.create(
      "Test User",
      "test@example.com",
      "testtesttest"
    );
    org = await orgsService.createForUser(user);
    featureService = module.get<FeaturesService>(FeaturesService);
    iterationsService = module.get<IterationsService>(IterationsService);
    fileRepository = module.get<Repository<File>>(getRepositoryToken(File));
  });

  afterEach(async () => {
    await cleanup();
  });

  describe("when creating a work item", () => {
    it("should return the created work item", async () => {
      const feature = await featureService.createFeature(
        user.id,
        {
          title: "my feature",
          description: "my feature description",
          priority: Priority.HIGH,
          status: FeatureStatus.PLANNED
        });
      const workItemResponse = await controller.create(
        {
          user: {
            sub: user.id
          }
        },
        {
          title: "my work item",
          description: "my work item description",
          priority: Priority.HIGH,
          type: WorkItemType.TECHNICAL_DEBT,
          feature: feature.id,
          status: WorkItemStatus.PLANNED
        }
      );

      expect(workItemResponse.id).toBeDefined();
      expect(workItemResponse.title).toEqual("my work item");
      expect(workItemResponse.description).toEqual("my work item description");
      expect(workItemResponse.priority).toEqual("high");
      expect(workItemResponse.type).toEqual("technical-debt");
      expect(workItemResponse.createdAt).toBeDefined();
      expect(workItemResponse.updatedAt).toBeDefined();
      expect(workItemResponse.status).toEqual("planned");
      expect(workItemResponse.feature).toBeDefined();
      expect(workItemResponse.feature.id).toEqual(feature.id);
      expect(workItemResponse.feature.title).toEqual(feature.title);
    });
    it("should create a work item with files", async () => {
      const file1Entity = new File();
      file1Entity.name = "file1";
      file1Entity.path = "path1";
      file1Entity.type = "image/png";
      file1Entity.size = 100;
      file1Entity.url = "url1";
      file1Entity.org = Promise.resolve(org);
      const file2Entity = new File();
      file2Entity.name = "file2";
      file2Entity.path = "path2";
      file2Entity.type = "image/png";
      file2Entity.size = 100;
      file2Entity.url = "url2";
      file2Entity.org = Promise.resolve(org);
      const file1 = await fileRepository.save(file1Entity);
      const file2 = await fileRepository.save(file2Entity);
      const workItemResponse = await controller.create(
        {
          user: {
            sub: user.id
          }
        },
        {
          title: "my work item",
          description: "my work item description",
          priority: Priority.HIGH,
          type: WorkItemType.TECHNICAL_DEBT,
          status: WorkItemStatus.PLANNED,
          files: [
            {
              id: file1.id
            },
            {
              id: file2.id
            }
          ]
        }
      );

      expect(workItemResponse.id).toBeDefined();
      expect(workItemResponse.title).toEqual("my work item");
      expect(workItemResponse.description).toEqual("my work item description");
      expect(workItemResponse.priority).toEqual("high");
      expect(workItemResponse.type).toEqual("technical-debt");
      expect(workItemResponse.createdAt).toBeDefined();
      expect(workItemResponse.updatedAt).toBeDefined();
      expect(workItemResponse.status).toEqual("planned");
      expect(workItemResponse.files).toBeDefined();
      expect(workItemResponse.files.length).toEqual(2);
      expect(workItemResponse.files[0].id).toEqual(file1.id);
      expect(workItemResponse.files[1].id).toEqual(file2.id);
    });
  });
  describe("when listing work items", () => {
    it("should return the list of work items", async () => {
      const feature = await featureService.createFeature(
        user.id,
        {
          title: "my feature",
          description: "my feature description",
          priority: Priority.HIGH,
          status: FeatureStatus.PLANNED
        });
      await controller.create(
        {
          user: {
            sub: user.id
          }
        },
        {
          title: "my work item",
          description: "my work item description",
          priority: Priority.HIGH,
          type: WorkItemType.TECHNICAL_DEBT,
          feature: feature.id,
          status: WorkItemStatus.PLANNED
        }
      );
      const workItems = await controller.list(
        {
          user: {
            org: org.id
          }
        }
      );

      expect(workItems.length).toEqual(1);
      expect(workItems[0].id).toBeDefined();
      expect(workItems[0].title).toEqual("my work item");
      expect(workItems[0].description).toEqual("my work item description");
      expect(workItems[0].priority).toEqual("high");
      expect(workItems[0].type).toEqual("technical-debt");
      expect(workItems[0].createdAt).toBeDefined();
      expect(workItems[0].updatedAt).toBeDefined();
      expect(workItems[0].status).toEqual("planned");
    });
  });
  describe("when getting a work item", () => {
    it("should return the work item", async () => {
      const feature = await featureService.createFeature(
        user.id,
        {
          title: "my feature",
          description: "my feature description",
          priority: Priority.HIGH,
          status: FeatureStatus.PLANNED
        });
      const workItem = await controller.create(
        {
          user: {
            sub: user.id
          }
        },
        {
          title: "my work item",
          description: "my work item description",
          priority: Priority.HIGH,
          type: WorkItemType.TECHNICAL_DEBT,
          feature: feature.id,
          status: WorkItemStatus.PLANNED
        }
      );
      const workItemResponse = await controller.get(
        {
          user: {
            org: org.id
          }
        },
        workItem.id
      );

      expect(workItemResponse.id).toBeDefined();
      expect(workItemResponse.title).toEqual("my work item");
      expect(workItemResponse.description).toEqual("my work item description");
      expect(workItemResponse.priority).toEqual("high");
      expect(workItemResponse.type).toEqual("technical-debt");
      expect(workItemResponse.createdAt).toBeDefined();
      expect(workItemResponse.updatedAt).toBeDefined();
      expect(workItemResponse.status).toEqual("planned");
      expect(workItemResponse.feature).toBeDefined();
      expect(workItemResponse.feature.id).toEqual(feature.id);
      expect(workItemResponse.feature.title).toEqual(feature.title);
    });
  });
  describe("when updating a work item", () => {
    it("should return the updated work item", async () => {
      const feature = await featureService.createFeature(
        user.id,
        {
          title: "my feature",
          description: "my feature description",
          priority: Priority.HIGH,
          status: FeatureStatus.PLANNED
        });
      const workItem = await controller.create(
        {
          user: {
            sub: user.id
          }
        },
        {
          title: "my work item",
          description: "my work item description",
          priority: Priority.HIGH,
          type: WorkItemType.TECHNICAL_DEBT,
          feature: feature.id,
          status: WorkItemStatus.PLANNED
        }
      );
      const workItemResponse = await controller.update(
        {
          user: {
            org: org.id
          }
        },
        workItem.id,
        {
          title: "my work item updated",
          description: "my work item description updated",
          priority: Priority.LOW,
          type: WorkItemType.BUG,
          feature: feature.id,
          status: WorkItemStatus.PLANNED
        }
      );

      expect(workItemResponse.id).toBeDefined();
      expect(workItemResponse.title).toEqual("my work item updated");
      expect(workItemResponse.description).toEqual("my work item description updated");
      expect(workItemResponse.priority).toEqual("low");
      expect(workItemResponse.type).toEqual("bug");
      expect(workItemResponse.createdAt).toBeDefined();
      expect(workItemResponse.updatedAt).toBeDefined();
      expect(workItemResponse.status).toEqual("planned");
      expect(workItemResponse.feature).toBeDefined();
      expect(workItemResponse.feature.id).toEqual(feature.id);
      expect(workItemResponse.feature.title).toEqual(feature.title);
    });
    it("should update the work item with files", async () => {
      const file1Entity = new File();
      file1Entity.name = "file1";
      file1Entity.path = "path1";
      file1Entity.type = "image/png";
      file1Entity.size = 100;
      file1Entity.url = "url1";
      file1Entity.org = Promise.resolve(org);
      const file2Entity = new File();
      file2Entity.name = "file2";
      file2Entity.path = "path2";
      file2Entity.type = "image/png";
      file2Entity.size = 100;
      file2Entity.url = "url2";
      file2Entity.org = Promise.resolve(org);
      const file1 = await fileRepository.save(file1Entity);
      const file2 = await fileRepository.save(file2Entity);
      const feature = await featureService.createFeature(
        user.id,
        {
          title: "my feature",
          description: "my feature description",
          priority: Priority.HIGH,
          status: FeatureStatus.PLANNED
        });
      const workItem = await controller.create(
        {
          user: {
            sub: user.id
          }
        },
        {
          title: "my work item",
          description: "my work item description",
          priority: Priority.HIGH,
          type: WorkItemType.TECHNICAL_DEBT,
          feature: feature.id,
          status: WorkItemStatus.PLANNED
        }
      );
      const workItemResponse = await controller.update(
        {
          user: {
            org: org.id
          }
        },
        workItem.id,
        {
          title: "my work item updated",
          description: "my work item description updated",
          priority: Priority.LOW,
          type: WorkItemType.BUG,
          status: WorkItemStatus.PLANNED,
          files: [
            {
              id: file1.id
            },
            {
              id: file2.id
            }
          ]
        }
      );

      expect(workItemResponse.id).toBeDefined();
      expect(workItemResponse.title).toEqual("my work item updated");
      expect(workItemResponse.description).toEqual("my work item description updated");
      expect(workItemResponse.priority).toEqual("low");
      expect(workItemResponse.type).toEqual("bug");
      expect(workItemResponse.createdAt).toBeDefined();
      expect(workItemResponse.updatedAt).toBeDefined();
      expect(workItemResponse.status).toEqual("planned");
      expect(workItemResponse.files).toBeDefined();
    });
  });
  describe("when deleting a work item", () => {
    it("should delete the work item", async () => {
      const feature = await featureService.createFeature(
        user.id,
        {
          title: "my feature",
          description: "my feature description",
          priority: Priority.HIGH,
          status: FeatureStatus.PLANNED
        });
      const workItem = await controller.create(
        {
          user: {
            sub: user.id
          }
        },
        {
          title: "my work item",
          description: "my work item description",
          priority: Priority.HIGH,
          type: WorkItemType.TECHNICAL_DEBT,
          feature: feature.id,
          status: WorkItemStatus.PLANNED
        }
      );
      await controller.delete(
        {
          user: {
            org: org.id
          }
        },
        workItem.id
      );
      const workItems = await controller.list(
        {
          user: {
            org: org.id
          }
        }
      );

      expect(workItems.length).toEqual(0);
    });
  });
  describe("when getting open work items", () => {
    it("should return the open work items", async () => {
      const feature = await featureService.createFeature(
        user.id,
        {
          title: "my feature",
          description: "my feature description",
          priority: Priority.HIGH,
          status: FeatureStatus.PLANNED
        });
      await controller.create(
        {
          user: {
            sub: user.id
          }
        },
        {
          title: "my work item",
          description: "my work item description",
          priority: Priority.HIGH,
          type: WorkItemType.TECHNICAL_DEBT,
          feature: feature.id,
          status: WorkItemStatus.PLANNED
        }
      );
      const workItems = await controller.listOpenWithoutIterations(
        {
          user: {
            org: org.id
          }
        }
      );

      expect(workItems.length).toEqual(1);
      expect(workItems[0].id).toBeDefined();
      expect(workItems[0].title).toEqual("my work item");
      expect(workItems[0].description).toEqual("my work item description");
      expect(workItems[0].priority).toEqual("high");
      expect(workItems[0].type).toEqual("technical-debt");
      expect(workItems[0].createdAt).toBeDefined();
      expect(workItems[0].updatedAt).toBeDefined();
      expect(workItems[0].status).toEqual("planned");
    });
  });
  describe("when patching a work item", () => {
    it("should update the iteration", async () => {
      const workItem = await controller.create(
        {
          user: {
            sub: user.id
          }
        },
        {
          title: "my work item",
          description: "my work item description",
          priority: Priority.HIGH,
          type: WorkItemType.TECHNICAL_DEBT,
          status: WorkItemStatus.PLANNED
        }
      );
      const iteration = await iterationsService.create(
        org.id,
        {
          goal: "my iteration description",
          startDate: "2019-01-01",
          duration: 2
        });
      const updatedWorkItem = await controller.patch(
        {
          user: {
            org: org.id
          }
        },
        workItem.id,
        {
          iteration: iteration.id
        }
      );
      expect(updatedWorkItem.id).toEqual(workItem.id);
      expect(updatedWorkItem.iteration.id).toEqual(iteration.id);
    });
    it("should update the status", async () => {
      const workItem = await controller.create(
        {
          user: {
            sub: user.id
          }
        },
        {
          title: "my work item",
          description: "my work item description",
          priority: Priority.HIGH,
          type: WorkItemType.TECHNICAL_DEBT,
          status: WorkItemStatus.PLANNED
        }
      );
      const updatedWorkItem = await controller.patch(
        {
          user: {
            org: org.id
          }
        },
        workItem.id,
        {
          status: WorkItemStatus.IN_PROGRESS
        }
      );
      expect(updatedWorkItem.id).toEqual(workItem.id);
      expect(updatedWorkItem.status).toEqual(WorkItemStatus.IN_PROGRESS);
    });
  });
});
