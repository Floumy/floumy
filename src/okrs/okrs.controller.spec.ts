import { OkrsController } from "./okrs.controller";
import { setupTestingModule } from "../../test/test.utils";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Objective } from "./objective.entity";
import { OkrsService } from "./okrs.service";
import { User } from "../users/user.entity";
import { OrgsService } from "../orgs/orgs.service";
import { Org } from "../orgs/org.entity";
import { TokensService } from "../auth/tokens.service";

describe("OkrsController", () => {
  let controller: OkrsController;
  let orgsService: OrgsService;
  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [TypeOrmModule.forFeature([Objective, Org])],
      [OkrsService, OrgsService, TokensService],
      [OkrsController]
    );
    cleanup = dbCleanup;
    controller = module.get<OkrsController>(OkrsController);
    orgsService = module.get<OrgsService>(OrgsService);
  });

  afterEach(async () => {
    await cleanup();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  async function createTestOrg() {
    const user = new User("Test User", "test@example.com", "testtesttest");
    return await orgsService.createForUser(user);
  }

  describe("when creating an OKR", () => {
    it("should return the created OKR", async () => {
      const org = await createTestOrg();
      const okr = await controller.create({
          user: {
            org: org.id
          }
        },
        {
          objective: {
            objective: "My OKR",
            description: "My OKR description"
          }
        });
      expect(okr.objective.objective).toEqual("My OKR");
      expect(okr.objective.description).toEqual("My OKR description");
    });
    it("should validate the OKR", async () => {
      const org = await createTestOrg();
      await expect(controller.create({
          user: {
            org: org.id
          }
        },
        {
          objective: {
            objective: "",
            description: "My OKR description"
          }
        })).rejects.toThrow();
    });
  });

  describe("when listing OKRs", () => {
    it("should return an empty array", async () => {
      const org = await createTestOrg();
      const okrs = await controller.list({
        user: {
          org: org.id
        }
      });
      expect(okrs).toEqual([]);
    });
    it("should return an array of OKRs", async () => {
      const org = await createTestOrg();
      await controller.create({
          user: {
            org: org.id
          }
        },
        {
          objective: {
            objective: "My OKR",
            description: "My OKR description"
          }
        });
      const okrs = await controller.list({
        user: {
          org: org.id
        }
      });
      expect(okrs.length).toEqual(1);
      expect(okrs[0].objective).toEqual("My OKR");
      expect(okrs[0].description).toEqual("My OKR description");
    });
  });

  describe("when getting an OKR", () => {
    it("should return the OKR", async () => {
      const org = await createTestOrg();
      const okr = await controller.create({
          user: {
            org: org.id
          }
        },
        {
          objective: {
            objective: "My OKR",
            description: "My OKR description"
          }
        });
      const okr2 = await controller.get(okr.objective.id,
        {
          user: {
            org: org.id
          }
        });
      expect(okr2.objective).toEqual("My OKR");
      expect(okr2.description).toEqual("My OKR description");
    });
  });

  describe("when updating an OKR", () => {
    it("should update the OKR", async () => {
      const org = await createTestOrg();
      const okr = await controller.create({
          user: {
            org: org.id
          }
        },
        {
          objective: {
            objective: "My OKR",
            description: "My OKR description"
          }
        });
      await controller.update(
        okr.objective.id,
        {
          user: {
            org: org.id
          }
        },
        {
          objective: {
            objective: "My OKR 2",
            description: "My OKR description 2"
          }
        });
      const okr2 = await controller.get(
        okr.objective.id,
        {
          user: {
            org: org.id
          }
        });
      expect(okr2.objective).toEqual("My OKR 2");
      expect(okr2.description).toEqual("My OKR description 2");
    });
  });

  describe("when deleting an OKR", () => {
    it("should delete the OKR", async () => {
      const org = await createTestOrg();
      const okr = await controller.create({
          user: {
            org: org.id
          }
        },
        {
          objective: {
            objective: "My OKR",
            description: "My OKR description"
          }
        });
      await controller.delete(
        okr.objective.id,
        {
          user: {
            org: org.id
          }
        }
      );
      await expect(controller.get(
        okr.objective.id,
        {
          user: {
            org: org.id
          }
        })).rejects.toThrow();
    });
  });
});
