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

describe("IterationsController", () => {
  let controller: IterationsController;
  let cleanup: () => Promise<void>;
  let org: Org;
  let featureService: FeaturesService;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [TypeOrmModule.forFeature([Org, Objective, KeyResult, Feature, WorkItem, Milestone]), UsersModule],
      [OkrsService, OrgsService, TokensService, FeaturesService, MilestonesService, WorkItemsService],
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
});
