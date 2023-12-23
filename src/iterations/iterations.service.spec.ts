import { UsersService } from "../users/users.service";
import { OrgsService } from "../orgs/orgs.service";
import { FeaturesService } from "../roadmap/features/features.service";
import { Org } from "../orgs/org.entity";
import { setupTestingModule } from "../../test/test.utils";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Objective } from "../okrs/objective.entity";
import { KeyResult } from "../okrs/key-result.entity";
import { Feature } from "../roadmap/features/feature.entity";
import { User } from "../users/user.entity";
import { Milestone } from "../roadmap/milestones/milestone.entity";
import { WorkItem } from "../backlog/work-items/work-item.entity";
import { OkrsService } from "../okrs/okrs.service";
import { MilestonesService } from "../roadmap/milestones/milestones.service";
import { IterationsService } from "./iterations.service";
import { Iteration } from "./Iteration.entity";
import { BacklogModule } from "../backlog/backlog.module";

describe("IterationsService", () => {
  let usersService: UsersService;
  let orgsService: OrgsService;
  let service: IterationsService;
  let org: Org;

  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [TypeOrmModule.forFeature([Objective, Org, KeyResult, Feature, User, Milestone, WorkItem, Iteration]), BacklogModule],
      [OkrsService, OrgsService, FeaturesService, UsersService, MilestonesService, IterationsService]
    );
    cleanup = dbCleanup;
    service = module.get<IterationsService>(IterationsService);
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

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("when creating an iteration", () => {
    it("should create an iteration", async () => {
      const iteration = await service.create(org.id, {
        goal: "Test Iteration",
        startDate: "2020-01-01",
        duration: 1
      });
      expect(iteration).toBeDefined();
      expect(iteration.id).toBeDefined();
      expect(iteration.title).toEqual("Iteration CW1-CW2 2020");
      expect(iteration.goal).toEqual("Test Iteration");
      expect(iteration.startDate).toEqual("2020-01-01");
      expect(iteration.duration).toEqual(1);
      expect(iteration.endDate).toEqual("2020-01-07");
      expect(iteration.createdAt).toBeDefined();
      expect(iteration.updatedAt).toBeDefined();
    });
    it("should calculate the correct iteration title", async () => {
      const iteration = await service.create(org.id, {
        goal: "Test Iteration",
        startDate: "2023-12-22",
        duration: 1
      });
      expect(iteration.title).toEqual("Iteration CW51-CW52 2023");
    });
  });
  describe("when listing iterations", () => {
    it("should list iterations", async () => {
      await service.create(org.id, {
        goal: "Test Iteration",
        startDate: "2020-01-01",
        duration: 1
      });
      const iterations = await service.list(org.id);
      expect(iterations[0].id).toBeDefined();
      expect(iterations[0].title).toEqual("Iteration CW1-CW2 2020");
      expect(iterations[0].goal).toEqual("Test Iteration");
      expect(iterations[0].startDate).toEqual("2020-01-01");
      expect(iterations[0].endDate).toEqual("2020-01-07");
      expect(iterations[0].duration).toEqual(1);
      expect(iterations[0].createdAt).toBeDefined();
      expect(iterations[0].updatedAt).toBeDefined();
    });
  });
  describe("when getting an iteration", () => {
    it("should get an iteration", async () => {
      const iteration = await service.create(org.id, {
        goal: "Test Iteration",
        startDate: "2020-01-01",
        duration: 1
      });
      const foundIteration = await service.get(org.id, iteration.id);
      expect(foundIteration.id).toBeDefined();
      expect(foundIteration.title).toEqual("Iteration CW1-CW2 2020");
      expect(foundIteration.goal).toEqual("Test Iteration");
      expect(foundIteration.startDate).toEqual("2020-01-01");
      expect(foundIteration.endDate).toEqual("2020-01-07");
      expect(foundIteration.duration).toEqual(1);
      expect(foundIteration.createdAt).toBeDefined();
      expect(foundIteration.updatedAt).toBeDefined();
    });
  });
  describe("when updating an iteration", () => {
    it("should update an iteration", async () => {
      const iteration = await service.create(org.id, {
        goal: "Test Iteration",
        startDate: "2020-01-01",
        duration: 1
      });
      const updatedIteration = await service.update(org.id, iteration.id, {
        goal: "Updated Test Iteration",
        startDate: "2020-01-01",
        duration: 2
      });
      expect(updatedIteration.id).toBeDefined();
      expect(updatedIteration.title).toEqual("Iteration CW1-CW3 2020");
      expect(updatedIteration.goal).toEqual("Updated Test Iteration");
      expect(updatedIteration.startDate).toEqual("2020-01-01");
      expect(updatedIteration.endDate).toEqual("2020-01-14");
      expect(updatedIteration.duration).toEqual(2);
      expect(updatedIteration.createdAt).toBeDefined();
      expect(updatedIteration.updatedAt).toBeDefined();
    });
  });

  describe("when deleting an iteration", () => {
    it("should delete an iteration", async () => {
      const iteration = await service.create(org.id, {
        goal: "Test Iteration",
        startDate: "2020-01-01",
        duration: 1
      });
      await service.delete(org.id, iteration.id);
      const iterations = await service.list(org.id);
      expect(iterations.length).toEqual(0);
    });
  });
});
