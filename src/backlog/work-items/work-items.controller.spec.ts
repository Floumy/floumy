import { WorkItemsController } from "./work-items.controller";
import { Org } from "../../orgs/org.entity";
import { setupTestingModule } from "../../../test/test.utils";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Feature } from "../../roadmap/features/feature.entity";
import { UsersModule } from "../../users/users.module";
import { OrgsService } from "../../orgs/orgs.service";
import { TokensService } from "../../auth/tokens.service";
import { FeaturesService } from "../../roadmap/features/features.service";
import { UsersService } from "../../users/users.service";
import { WorkItem } from "./work-item.entity";
import { Priority } from "../../common/priority.enum";
import { Timeline } from "../../common/timeline.enum";
import { WorkItemType } from "./work-item-type.enum";
import { Objective } from "../../okrs/objective.entity";
import { KeyResult } from "../../okrs/key-result.entity";
import { OkrsService } from "../../okrs/okrs.service";
import { Milestone } from "../../roadmap/milestones/milestone.entity";
import { MilestonesService } from "../../roadmap/milestones/milestones.service";
import { WorkItemsService } from "./work-items.service";

describe("WorkItemsController", () => {
  let controller: WorkItemsController;
  let cleanup: () => Promise<void>;
  let org: Org;
  let featureService: FeaturesService;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [TypeOrmModule.forFeature([Org, Objective, KeyResult, Feature, WorkItem, Milestone]), UsersModule],
      [OkrsService, OrgsService, TokensService, FeaturesService, MilestonesService, WorkItemsService],
      [WorkItemsController]
    );
    cleanup = dbCleanup;
    controller = module.get<WorkItemsController>(WorkItemsController);
    const orgsService = module.get<OrgsService>(OrgsService);
    const usersService = module.get<UsersService>(UsersService);
    const user = await usersService.create(
      "Test User",
      "test@example.com",
      "testtesttest"
    );
    org = await orgsService.createForUser(user);
    featureService = module.get<FeaturesService>(FeaturesService);
  });

  afterEach(async () => {
    await cleanup();
  });

  describe("when creating a work item", () => {
    it("should return the created work item", async () => {
      const feature = await featureService.createFeature(
        org.id,
        {
          title: "my feature",
          description: "my feature description",
          priority: Priority.HIGH,
          timeline: Timeline.NEXT_QUARTER
        });
      const workItemResponse = await controller.create(
        {
          user: {
            org: org.id
          }
        },
        {
          title: "my work item",
          description: "my work item description",
          priority: Priority.HIGH,
          type: WorkItemType.TECHNICAL_DEBT,
          feature: feature.id
        }
      );

      expect(workItemResponse.id).toBeDefined();
      expect(workItemResponse.title).toEqual("my work item");
      expect(workItemResponse.description).toEqual("my work item description");
      expect(workItemResponse.priority).toEqual("high");
      expect(workItemResponse.type).toEqual("user-story");
      expect(workItemResponse.createdAt).toBeDefined();
      expect(workItemResponse.updatedAt).toBeDefined();
      expect(workItemResponse.status).toEqual("backlog");
      expect(workItemResponse.feature).toBeDefined();
      expect(workItemResponse.feature.id).toEqual(feature.id);
      expect(workItemResponse.feature.title).toEqual(feature.title);
    });
  });
});
