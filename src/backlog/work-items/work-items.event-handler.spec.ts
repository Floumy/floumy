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
import { Repository } from "typeorm";
import { WorkItemStatus } from "./work-item-status.enum";
import { Iteration } from "../../iterations/Iteration.entity";
import { WorkItem } from "./work-item.entity";
import { IterationsService } from "../../iterations/iterations.service";
import { File } from "../../files/file.entity";
import { WorkItemFile } from "./work-item-file.entity";
import { FeatureFile } from "../../roadmap/features/feature-file.entity";
import { WorkItemsEventHandler } from "./work-items.event-handler";
import { WorkItemsStatusStats } from "./work-items-status-stats.entity";
import { WorkItemsStatusLog } from "./work-items-status-log.entity";

describe("WorkItemsEventHandler", () => {
  let usersService: UsersService;
  let orgsService: OrgsService;
  let workItemsService: WorkItemsService;
  let workItemsStatusStatsRepository: Repository<WorkItemsStatusStats>;
  let workItemsStatusLogRepository: Repository<WorkItemsStatusLog>;
  let org: Org;
  let user: User;

  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [TypeOrmModule.forFeature([Objective, Org, KeyResult, Feature, User, Milestone, Iteration, WorkItem, File, FeatureFile, WorkItemFile, WorkItemsStatusStats, WorkItemsStatusLog])],
      [OkrsService, OrgsService, FeaturesService, UsersService, MilestonesService, WorkItemsService, IterationsService, WorkItemsEventHandler]
    );
    cleanup = dbCleanup;
    orgsService = module.get<OrgsService>(OrgsService);
    usersService = module.get<UsersService>(UsersService);
    workItemsService = module.get<WorkItemsService>(WorkItemsService);
    workItemsStatusStatsRepository = module.get<Repository<WorkItemsStatusStats>>(getRepositoryToken(WorkItemsStatusStats));
    workItemsStatusLogRepository = module.get<Repository<WorkItemsStatusLog>>(getRepositoryToken(WorkItemsStatusLog));
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

  describe("workItem.created", () => {
    it("should create a work item log and status stats", async () => {
      const workItem = await workItemsService.createWorkItem(user.id, {
        title: "Test Work Item",
        description: "Test Work Item Description",
        type: WorkItemType.USER_STORY,
        priority: Priority.MEDIUM,
        status: WorkItemStatus.PLANNED,
        estimation: 5
      });
      const workItemsStatusStats = await workItemsStatusStatsRepository.findOne({
        where: { workItem: { id: workItem.id } }
      });
      const workItemsStatusLog = await workItemsStatusLogRepository.findOne({
        where: { workItemId: workItem.id }
      });
      expect(workItemsStatusStats).toBeDefined();
      expect(workItemsStatusLog).toBeDefined();
    });
  });
  describe("workItem.deleted", () => {
    it("should delete a work item log and status stats", async () => {
      const workItem = await workItemsService.createWorkItem(user.id, {
        title: "Test Work Item",
        description: "Test Work Item Description",
        type: WorkItemType.USER_STORY,
        priority: Priority.MEDIUM,
        status: WorkItemStatus.PLANNED,
        estimation: 5
      });
      await workItemsService.deleteWorkItem(org.id, workItem.id);
      const workItemsStatusStats = await workItemsStatusStatsRepository.findOne({
        where: { workItem: { id: workItem.id } }
      });
      const workItemsStatusLog = await workItemsStatusLogRepository.findOne({
        where: { workItemId: workItem.id }
      });
      expect(workItemsStatusStats).toBeNull();
      expect(workItemsStatusLog).toBeNull();
    });
  });
  describe("workItem.updated", () => {
    it("should update a work item log and status stats", async () => {
      const workItem = await workItemsService.createWorkItem(user.id, {
        title: "Test Work Item",
        description: "Test Work Item Description",
        type: WorkItemType.USER_STORY,
        priority: Priority.MEDIUM,
        status: WorkItemStatus.PLANNED,
        estimation: 5
      });
      await workItemsService.patchWorkItem(org.id, workItem.id, {
        status: WorkItemStatus.IN_PROGRESS
      });
      const workItemsStatusStats = await workItemsStatusStatsRepository.findOne({
        where: { workItem: { id: workItem.id } }
      });
      const workItemsStatusLog = await workItemsStatusLogRepository.findOne({
        where: { workItemId: workItem.id }
      });
      expect(workItemsStatusStats).toBeDefined();
      expect(workItemsStatusLog).toBeDefined();
    });
  });
});
