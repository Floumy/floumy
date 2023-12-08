import { MilestonesController } from "./milestones.controller";
import { Org } from "../../orgs/org.entity";
import { setupTestingModule } from "../../../test/test.utils";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Objective } from "../../okrs/objective.entity";
import { KeyResult } from "../../okrs/key-result.entity";
import { UsersModule } from "../../users/users.module";
import { OkrsService } from "../../okrs/okrs.service";
import { OrgsService } from "../../orgs/orgs.service";
import { TokensService } from "../../auth/tokens.service";
import { UsersService } from "../../users/users.service";
import { MilestonesService } from "./milestones.service";
import { Milestone } from "./milestone.entity";
import { Timeline } from "../../common/timeline.enum";
import { Feature } from "../features/feature.entity";

describe("MilestonesController", () => {
  let controller: MilestonesController;
  let cleanup: () => Promise<void>;
  let org: Org;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [TypeOrmModule.forFeature([Org, Objective, KeyResult, Milestone, Feature]), UsersModule],
      [OkrsService, OrgsService, TokensService, MilestonesService],
      [MilestonesController]
    );
    cleanup = dbCleanup;
    controller = module.get<MilestonesController>(MilestonesController);
    const orgsService = module.get<OrgsService>(OrgsService);
    const usersService = module.get<UsersService>(UsersService);
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
    expect(controller).toBeDefined();
  });

  describe("when creating a milestone", () => {
    it("should return the milestone", async () => {
      const okrResponse = await controller.create(
        {
          user: {
            org: org.id
          }
        },
        {
          title: "my milestone",
          description: "my milestone",
          dueDate: "2020-01-01"
        }
      );
      expect(okrResponse.id).toBeDefined();
      expect(okrResponse.title).toEqual("my milestone");
      expect(okrResponse.description).toEqual("my milestone");
      expect(okrResponse.timeline).toEqual(Timeline.PAST.valueOf());
      expect(okrResponse.dueDate).toEqual("2020-01-01");
    });
  });
  describe("when listing milestones", () => {
    it("should return the milestones", async () => {
      await controller.create(
        {
          user: {
            org: org.id
          }
        },
        {
          title: "my milestone",
          description: "my milestone",
          dueDate: "2020-01-01"
        }
      );
      const milestones = await controller.list({
        user: {
          org: org.id
        }
      });
      expect(milestones.length).toEqual(1);
      expect(milestones[0].id).toBeDefined();
      expect(milestones[0].title).toEqual("my milestone");
      expect(milestones[0].dueDate).toEqual("2020-01-01");
    });
  });

  describe("when listing milestones with features", () => {
    it("should return the milestones", async () => {
      await controller.create(
        {
          user: {
            org: org.id
          }
        },
        {
          title: "my milestone",
          description: "my milestone",
          dueDate: "2020-01-01"
        }
      );
      const milestones = await controller.listMilestonesWithFeatures({
        user: {
          org: org.id
        }
      });
      expect(milestones.length).toEqual(1);
      expect(milestones[0].id).toBeDefined();
      expect(milestones[0].title).toEqual("my milestone");
      expect(milestones[0].dueDate).toEqual("2020-01-01");
    });
  });
  describe("when getting a milestone", () => {
    it("should return the milestone", async () => {
      const milestone = await controller.create(
        {
          user: {
            org: org.id
          }
        },
        {
          title: "my milestone",
          description: "my milestone",
          dueDate: "2020-01-01"
        }
      );
      const milestoneResponse = await controller.get({
        user: {
          org: org.id
        }
      }, milestone.id);
      expect(milestoneResponse.id).toBeDefined();
      expect(milestoneResponse.title).toEqual("my milestone");
      expect(milestoneResponse.description).toEqual("my milestone");
      expect(milestoneResponse.timeline).toEqual(Timeline.PAST.valueOf());
      expect(milestoneResponse.dueDate).toEqual("2020-01-01");
    });
  });
  describe("when updating a milestone", () => {
    it("should return the milestone", async () => {
      const milestone = await controller.create(
        {
          user: {
            org: org.id
          }
        },
        {
          title: "my milestone",
          description: "my milestone",
          dueDate: "2020-01-01"
        }
      );
      const milestoneResponse = await controller.update({
        user: {
          org: org.id
        }
      }, milestone.id, {
        title: "my milestone",
        description: "my milestone",
        dueDate: "2020-01-01"
      });
      expect(milestoneResponse.id).toBeDefined();
      expect(milestoneResponse.title).toEqual("my milestone");
      expect(milestoneResponse.description).toEqual("my milestone");
      expect(milestoneResponse.timeline).toEqual(Timeline.PAST.valueOf());
      expect(milestoneResponse.dueDate).toEqual("2020-01-01");
    });
  });
  describe("when deleting a milestone", () => {
    it("deletes the milestone", async () => {
      const milestone = await controller.create(
        {
          user: {
            org: org.id
          }
        },
        {
          title: "my milestone",
          description: "my milestone",
          dueDate: "2020-01-01"
        }
      );
      const milestoneResponse = await controller.delete({
        user: {
          org: org.id
        }
      }, milestone.id);
      expect(milestoneResponse).toBeUndefined();
    });
  });
});
