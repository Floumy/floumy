import { IterationsController } from "./iterations.controller";
import { Org } from "../orgs/org.entity";
import { FeaturesService } from "../roadmap/features/features.service";
import { setupTestingModule } from "../../test/test.utils";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Objective } from "../okrs/objective.entity";
import { KeyResult } from "../okrs/key-result.entity";
import { Feature } from "../roadmap/features/feature.entity";
import { WorkItem } from "../backlog/work-items/work-item.entity";
import { Milestone } from "../roadmap/milestones/milestone.entity";
import { UsersModule } from "../users/users.module";
import { OkrsService } from "../okrs/okrs.service";
import { OrgsService } from "../orgs/orgs.service";
import { TokensService } from "../auth/tokens.service";
import { MilestonesService } from "../roadmap/milestones/milestones.service";
import { WorkItemsService } from "../backlog/work-items/work-items.service";
import { UsersService } from "../users/users.service";
import { Iteration } from "./Iteration.entity";
import { IterationsService } from "./iterations.service";
import { Priority } from "../common/priority.enum";
import { WorkItemType } from "../backlog/work-items/work-item-type.enum";
import { WorkItemStatus } from "../backlog/work-items/work-item-status.enum";

describe("IterationsController", () => {
  let controller: IterationsController;
  let cleanup: () => Promise<void>;
  let org: Org;
  let featureService: FeaturesService;
  let workItemService: WorkItemsService;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [TypeOrmModule.forFeature([Org, Objective, KeyResult, Feature, WorkItem, Milestone, Iteration]), UsersModule],
      [OkrsService, OrgsService, TokensService, FeaturesService, MilestonesService, WorkItemsService, IterationsService],
      [IterationsController]
    );
    cleanup = dbCleanup;
    controller = module.get<IterationsController>(IterationsController);
    const orgsService = module.get<OrgsService>(OrgsService);
    const usersService = module.get<UsersService>(UsersService);
    const user = await usersService.create(
      "Test User",
      "test@example.com",
      "testtesttest"
    );
    org = await orgsService.createForUser(user);
    featureService = module.get<FeaturesService>(FeaturesService);
    workItemService = module.get<WorkItemsService>(WorkItemsService);
  });

  afterEach(async () => {
    await cleanup();
  });


  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("when creating a new iteration", () => {
    it("should create a new iteration", async () => {
      const iteration = await controller.create({
        user: { orgId: org.id }
      }, {
        goal: "Goal 1",
        startDate: "2020-01-01",
        duration: 1
      });
      expect(iteration.goal).toEqual("Goal 1");
      expect(iteration.startDate).toEqual("2020-01-01");
      expect(iteration.duration).toEqual(1);
    });
  });

  describe("when listing iterations", () => {
    it("should list iterations", async () => {
      await controller.create({
        user: { orgId: org.id }
      }, {
        goal: "Goal 1",
        startDate: "2020-01-01",
        duration: 1
      });
      const iterations = await controller.list({
        user: { orgId: org.id }
      });
      expect(iterations.length).toEqual(1);
      expect(iterations[0].goal).toEqual("Goal 1");
      expect(iterations[0].startDate).toEqual("2020-01-01");
      expect(iterations[0].duration).toEqual(1);
    });
  });

  describe("when getting an iteration", () => {
    it("should get an iteration", async () => {
      const iteration = await controller.create({
        user: { orgId: org.id }
      }, {
        goal: "Goal 1",
        startDate: "2020-01-01",
        duration: 1
      });
      const foundIteration = await controller.get({
        user: { orgId: org.id }
      }, iteration.id);
      expect(foundIteration.goal).toEqual("Goal 1");
      expect(foundIteration.startDate).toEqual("2020-01-01");
      expect(foundIteration.duration).toEqual(1);
    });
  });

  describe("when updating an iteration", () => {
    it("should update an iteration", async () => {
      const iteration = await controller.create({
        user: { orgId: org.id }
      }, {
        goal: "Goal 1",
        startDate: "2020-01-01",
        duration: 1
      });
      const updatedIteration = await controller.update({
        user: { orgId: org.id }
      }, iteration.id, {
        goal: "Goal 2",
        startDate: "2020-01-02",
        duration: 2
      });
      expect(updatedIteration.goal).toEqual("Goal 2");
      expect(updatedIteration.startDate).toEqual("2020-01-02");
      expect(updatedIteration.duration).toEqual(2);
    });
  });
  describe("when deleting an iteration", () => {
    it("should delete an iteration", async () => {
      const iteration = await controller.create({
        user: { orgId: org.id }
      }, {
        goal: "Goal 1",
        startDate: "2020-01-01",
        duration: 1
      });
      await controller.delete({
        user: { orgId: org.id }
      }, iteration.id);
      const iterations = await controller.list({
        user: { orgId: org.id }
      });
      expect(iterations.length).toEqual(0);
    });
  });
  describe("when getting current and future iterations", () => {
    it("should return a list of current and future iterations", async () => {
      const startDate = (new Date()).toISOString().split("T")[0];
      await controller.create({
        user: { orgId: org.id }
      }, {
        goal: "Goal 1",
        startDate: startDate,
        duration: 1
      });
      const iterations = await controller.listCurrentAndFuture({
        user: { orgId: org.id }
      });
      expect(iterations.length).toEqual(1);
      expect(iterations[0].goal).toEqual("Goal 1");
      expect(iterations[0].startDate).toEqual(startDate);
      expect(iterations[0].duration).toEqual(1);
    });
  });
  describe("when starting an iteration", () => {
    it("should start an iteration", async () => {
      const startDate = (new Date()).toISOString().split("T")[0];
      const iteration = await controller.create({
        user: { orgId: org.id }
      }, {
        goal: "Goal 1",
        startDate: startDate,
        duration: 1
      });
      const startedIteration = await controller.startIteration({
        user: { orgId: org.id }
      }, iteration.id);
      expect(startedIteration.goal).toEqual("Goal 1");
      expect(startedIteration.startDate).toEqual(startDate);
      expect(startedIteration.actualStartDate).toBeDefined();
      expect(startedIteration.duration).toEqual(1);
      expect(startedIteration.status).toEqual("active");
    });
  });
  describe("when getting the active iteration", () => {
    it("should return the active iteration", async () => {
      const startDate = (new Date()).toISOString().split("T")[0];
      const iteration = await controller.create({
        user: { orgId: org.id }
      }, {
        goal: "Goal 1",
        startDate: startDate,
        duration: 1
      });
      await workItemService.createWorkItem(org.id, {
        title: "Work Item 1",
        description: "Work Item 1",
        priority: Priority.LOW,
        type: WorkItemType.TECHNICAL_DEBT,
        status: WorkItemStatus.READY_TO_START,
        iteration: iteration.id
      });
      await controller.startIteration({
        user: { orgId: org.id }
      }, iteration.id);
      const activeIteration = await controller.getActiveIteration({
        user: { orgId: org.id }
      });
      expect(activeIteration.goal).toEqual("Goal 1");
      expect(activeIteration.startDate).toEqual(startDate);
      expect(activeIteration.duration).toEqual(1);
      expect(activeIteration.status).toEqual("active");
      expect(activeIteration.workItems.length).toEqual(1);
    });
  });
  describe("when completing an iteration", () => {
    it("should complete an iteration", async () => {
      const startDate = (new Date()).toISOString().split("T")[0];
      const iteration = await controller.create({
        user: { orgId: org.id }
      }, {
        goal: "Goal 1",
        startDate: startDate,
        duration: 1
      });
      await controller.startIteration({
        user: { orgId: org.id }
      }, iteration.id);
      const completedIteration = await controller.completeIteration({
        user: { orgId: org.id }
      }, iteration.id);
      expect(completedIteration.goal).toEqual("Goal 1");
      expect(completedIteration.startDate).toEqual(startDate);
      expect(completedIteration.duration).toEqual(1);
      expect(completedIteration.status).toEqual("completed");
    });
  });
});
