import { MilestonesService } from "./milestones.service";
import { UsersService } from "../../users/users.service";
import { OrgsService } from "../../orgs/orgs.service";
import { Org } from "../../orgs/org.entity";
import { setupTestingModule } from "../../../test/test.utils";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Objective } from "../../okrs/objective.entity";
import { KeyResult } from "../../okrs/key-result.entity";
import { User } from "../../users/user.entity";
import { Milestone } from "./milestone.entity";

describe("MilestonesService", () => {
  let usersService: UsersService;
  let service: MilestonesService;
  let orgsService: OrgsService;

  let org: Org;

  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [TypeOrmModule.forFeature([Objective, Org, KeyResult, Milestone, User])],
      [OrgsService, MilestonesService, UsersService]
    );
    cleanup = dbCleanup;
    service = module.get<MilestonesService>(MilestonesService);
    usersService = module.get<UsersService>(UsersService);
    orgsService = module.get<OrgsService>(OrgsService);
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

  describe("when creating a milestone", () => {
    it("should return a milestone", async () => {
      const milestone = await service.createMilestone(org.id, {
        title: "my milestone",
        description: "my milestone",
        dueDate: "2020-01-01"
      });
      expect(milestone.id).toBeDefined();
      expect(milestone.title).toEqual("my milestone");
      expect(milestone.description).toEqual("my milestone");
      expect(milestone.dueDate).toEqual("2020-01-01");
    });
    it("should throw an error if title is missing", async () => {
      await expect(
        service.createMilestone(org.id, {
          title: "",
          description: "my milestone",
          dueDate: "2020-01-01"
        })
      ).rejects.toThrow("Milestone title is required");
    });
    it("should throw an error if description is missing", async () => {
      await expect(
        service.createMilestone(org.id, {
          title: "my milestone",
          description: "",
          dueDate: "2020-01-01"
        })
      ).rejects.toThrow("Milestone description is required");
    });
    it("should throw an error if dueDate is missing", async () => {
      await expect(
        service.createMilestone(org.id, {
          title: "my milestone",
          description: "my milestone",
          dueDate: ""
        })
      ).rejects.toThrow("Milestone due date is required");
    });
    it("should throw an error if dueDate is invalid", async () => {
      await expect(
        service.createMilestone(org.id, {
          title: "my milestone",
          description: "my milestone",
          dueDate: "2020-01"
        })
      ).rejects.toThrow("Invalid due date");
    });
  });
});
