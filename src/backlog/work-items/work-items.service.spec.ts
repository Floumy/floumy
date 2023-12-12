import { Test, TestingModule } from "@nestjs/testing";
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
import { WorkItem } from "./work-item.entity";
import { Priority } from "../../common/priority.enum";
import { Timeline } from "../../common/timeline.enum";
import { WorkItemType } from "./work-item-type.enum";

describe("WorkItemsService", () => {
  let usersService: UsersService;
  let orgsService: OrgsService;
  let featuresService: FeaturesService;
  let service: WorkItemsService;
  let org: Org;

  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [TypeOrmModule.forFeature([Objective, Org, KeyResult, Feature, User, Milestone, WorkItem])],
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
          timeline: Timeline.NEXT_QUARTER
        });
      const workItem = await service.createWorkItem(
        org.id,
        {
          title: "my work item",
          description: "my work item description",
          priority: Priority.HIGH,
          type: WorkItemType.USER_STORY,
          feature: feature.id
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
});
