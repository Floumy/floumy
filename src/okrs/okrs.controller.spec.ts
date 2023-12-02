import { OkrsController } from "./okrs.controller";
import { setupTestingModule } from "../../test/test.utils";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Objective } from "./objective.entity";
import { OkrsService } from "./okrs.service";
import { User } from "../users/user.entity";
import { OrgsService } from "../orgs/orgs.service";
import { Org } from "../orgs/org.entity";
import { TokensService } from "../auth/tokens.service";
import { KeyResult } from "./key-result.entity";
import { NotFoundException } from "@nestjs/common";

describe("OkrsController", () => {
  let controller: OkrsController;
  let orgsService: OrgsService;
  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [TypeOrmModule.forFeature([Objective, Org, KeyResult])],
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
            title: "My OKR"
          }
        });
      expect(okr.objective.title).toEqual("My OKR");
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
            title: ""
          }
        })).rejects.toThrow();
    });
    it("should validate the timeline when it exists", async () => {
      const org = await createTestOrg();
      await expect(controller.create({
          user: {
            org: org.id
          }
        },
        {
          objective: {
            title: "My OKR",
            timeline: "invalid"
          }
        })).rejects.toThrow();
    });
    it("should store the timeline when it exists", async () => {
      const org = await createTestOrg();
      const okr = await controller.create({
          user: {
            org: org.id
          }
        },
        {
          objective: {
            title: "My OKR",
            timeline: "this-quarter"
          }
        });
      expect(okr.objective.timeline).toEqual("this-quarter");
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
            title: "My OKR"
          }
        });
      const okrs = await controller.list({
        user: {
          org: org.id
        }
      });
      expect(okrs.length).toEqual(1);
      expect(okrs[0].title).toEqual("My OKR");
      expect(okrs[0].status).toEqual("on-track");
      expect(okrs[0].createdAt).toBeDefined();
      expect(okrs[0].updatedAt).toBeDefined();
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
            title: "My OKR"
          }
        });
      const okr2 = await controller.get(okr.objective.id,
        {
          user: {
            org: org.id
          }
        });
      expect(okr2.objective.title).toEqual("My OKR");
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
            title: "My OKR"
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
            title: "My OKR 2"
          }
        });
      const okr2 = await controller.get(
        okr.objective.id,
        {
          user: {
            org: org.id
          }
        });
      expect(okr2.objective.title).toEqual("My OKR 2");
    });

    it("should update the OKR and its key results", async () => {
      const org = await createTestOrg();
      const okr = await controller.create({
          user: {
            org: org.id
          }
        },
        {
          objective: {
            title: "My OKR"
          },
          keyResults: [
            { title: "My key result" },
            { title: "My key result 2" },
            { title: "My key result 3" }
          ]
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
            title: "My OKR 2"
          },
          keyResults: [
            { title: "My key result 4" },
            { title: "My key result 5" },
            { title: "My key result 6" }
          ]
        });
      const okr2 = await controller.get(
        okr.objective.id,
        {
          user: {
            org: org.id
          }
        });
      expect(okr2.objective.title).toEqual("My OKR 2");
      expect(okr2.keyResults.length).toEqual(3);
      expect(okr2.keyResults[0].title).toEqual("My key result 4");
      expect(okr2.keyResults[1].title).toEqual("My key result 5");
      expect(okr2.keyResults[2].title).toEqual("My key result 6");
    });

    it("should update the timeline when it exists", async () => {
      const org = await createTestOrg();
      const okr = await controller.create({
          user: {
            org: org.id
          }
        },
        {
          objective: {
            title: "My OKR"
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
            title: "My OKR 2",
            timeline: "this-quarter"
          }
        });
      const okr2 = await controller.get(
        okr.objective.id,
        {
          user: {
            org: org.id
          }
        });
      expect(okr2.objective.timeline).toEqual("this-quarter");
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
            title: "My OKR"
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
    it("should delete the OKR and its key results", async () => {
      const org = await createTestOrg();
      const okr = await controller.create({
          user: {
            org: org.id
          }
        },
        {
          objective: {
            title: "My OKR"
          },
          keyResults: [
            { title: "My key result" },
            { title: "My key result 2" },
            { title: "My key result 3" }
          ]
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
        })).rejects.toThrow(NotFoundException);
    });
  });

  describe("when creating an OKR with key results", () => {
    it("should return the created OKR with key results", async () => {
      const org = await createTestOrg();
      const okr = await controller.create({
          user: {
            org: org.id
          }
        },
        {
          objective: {
            title: "My OKR"
          },
          keyResults: [
            { title: "My key result" },
            { title: "My key result 2" },
            { title: "My key result 3" }
          ]
        });
      expect(okr.keyResults.length).toEqual(3);
      expect(okr.keyResults[0].title).toEqual("My key result");
      expect(okr.keyResults[1].title).toEqual("My key result 2");
      expect(okr.keyResults[2].title).toEqual("My key result 3");
    });
  });

  describe("when updating Key Results Progress", () => {
    it("should update the Key Result Progress", async () => {
      const org = await createTestOrg();
      const okr = await controller.create({
          user: {
            org: org.id
          }
        },
        {
          objective: {
            title: "My OKR"
          },
          keyResults: [
            { title: "My key result" },
            { title: "My key result 2" },
            { title: "My key result 3" }
          ]
        });
      await controller.patchKeyResult(
        okr.objective.id,
        okr.keyResults[0].id,
        {
          user: {
            org: org.id
          }
        },
        {
          progress: 0.5
        });
      const okr2 = await controller.get(
        okr.objective.id,
        {
          user: {
            org: org.id
          }
        });
      expect(okr2.keyResults[0].progress).toEqual(0.5);
    });
    it("should not update the Key Result Progress if the Key Result does not belong to the OKR", async () => {
      const org = await createTestOrg();
      const org2 = await createTestOrg();
      const okr = await controller.create({
          user: {
            org: org.id
          }
        },
        {
          objective: {
            title: "My OKR"
          },
          keyResults: [
            { title: "My key result" },
            { title: "My key result 2" },
            { title: "My key result 3" }
          ]
        });
      await expect(controller.patchKeyResult(
        okr.objective.id,
        okr.keyResults[0].id,
        {
          user: {
            org: org2.id
          }
        },
        {
          progress: 0.5
        })).rejects.toThrow();
    });
    it("should update the Objective Progress", async () => {
      const org = await createTestOrg();
      const okr = await controller.create({
          user: {
            org: org.id
          }
        },
        {
          objective: {
            title: "My OKR"
          },
          keyResults: [
            { title: "My key result" },
            { title: "My key result 2" },
            { title: "My key result 3" }
          ]
        });
      await controller.patchKeyResult(
        okr.objective.id,
        okr.keyResults[0].id,
        {
          user: {
            org: org.id
          }
        },
        {
          progress: 0.5
        });
      const okr2 = await controller.get(
        okr.objective.id,
        {
          user: {
            org: org.id
          }
        });
      expect(okr2.objective.progress).toEqual(0.17);
    });
    it("should update the key result status", async () => {
      const org = await createTestOrg();
      const okr = await controller.create({
          user: {
            org: org.id
          }
        },
        {
          objective: {
            title: "My OKR"
          },
          keyResults: [
            { title: "My key result" },
            { title: "My key result 2" },
            { title: "My key result 3" }
          ]
        });
      await controller.patchKeyResult(
        okr.objective.id,
        okr.keyResults[0].id,
        {
          user: {
            org: org.id
          }
        },
        {
          status: "off-track"
        });
      const okr2 = await controller.get(
        okr.objective.id,
        {
          user: {
            org: org.id
          }
        });
      expect(okr2.keyResults[0].status).toEqual("off-track");
    });
  });

  describe("when updating the Objective Progress", () => {
    it("should update the Objective Progress", async () => {
      const org = await createTestOrg();
      const okr = await controller.create({
          user: {
            org: org.id
          }
        },
        {
          objective: {
            title: "My OKR"
          },
          keyResults: [
            { title: "My key result" },
            { title: "My key result 2" },
            { title: "My key result 3" }
          ]
        });
      await controller.patchObjective(
        okr.objective.id,
        {
          user: {
            org: org.id
          }
        },
        {
          status: "off-track"
        });
      const okr2 = await controller.get(
        okr.objective.id,
        {
          user: {
            org: org.id
          }
        });
      expect(okr2.objective.status).toEqual("off-track");
    });
  });
  describe("when getting the key results list", () => {
    it("should return the key results list", async () => {
      const org = await createTestOrg();
      await controller.create({
          user: {
            org: org.id
          }
        },
        {
          objective: {
            title: "My OKR"
          },
          keyResults: [
            { title: "My key result" },
            { title: "My key result 2" },
            { title: "My key result 3" }
          ]
        });
      const keyResults = await controller.listKeyResults(
        {
          user: {
            org: org.id
          }
        });
      expect(keyResults.length).toEqual(3);
      // check that the items are in the list regardless of the order
      expect(keyResults.map(kr => kr.title).sort()).toEqual(["My key result", "My key result 2", "My key result 3"]);
    });
  });
});
