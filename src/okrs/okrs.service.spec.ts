import { OkrsService } from "./okrs.service";
import { setupTestingModule } from "../../test/test.utils";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Objective } from "./objective.entity";
import { OrgsService } from "../orgs/orgs.service";
import { User } from "../users/user.entity";
import { Org } from "../orgs/org.entity";
import { KeyResult } from "./key-result.entity";

describe("OkrsService", () => {
  let service: OkrsService;
  let orgsService: OrgsService;
  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [TypeOrmModule.forFeature([Objective, Org, KeyResult])],
      [OkrsService, OrgsService]
    );
    cleanup = dbCleanup;
    service = module.get<OkrsService>(OkrsService);
    orgsService = module.get<OrgsService>(OrgsService);
  });

  afterEach(async () => {
    await cleanup();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  async function createTestOrg() {
    const user = new User("Test User", "test@example.com", "testtesttest");
    return await orgsService.createForUser(user);
  }

  describe("when creating an objective", () => {
    it("should return the objective", async () => {
      const org = await createTestOrg();
      const objective = await service.createObjective(
        org.id,
        "Test Objective",
        "Test Objective Description"
      );
      expect(objective).toBeDefined();
      expect(objective.id).toBeDefined();
      expect(objective.createdAt).toBeDefined();
      expect(objective.updatedAt).toBeDefined();
    });
    it("should store the objective", async () => {
      const org = await createTestOrg();
      const objective = await service.createObjective(
        org.id,
        "Test Objective",
        "Test Objective Description"
      );
      const storedObjective = await service.findObjectiveById(objective.id);
      expect(storedObjective).toBeDefined();
      expect(storedObjective.title).toEqual(objective.title);
      expect(storedObjective.description).toEqual(objective.description);
      expect(storedObjective.createdAt).toEqual(objective.createdAt);
      expect(storedObjective.updatedAt).toEqual(objective.updatedAt);
    });

    it("should validate the objective", async () => {
      const org = await createTestOrg();
      await expect(service.createObjective(
        org.id,
        "",
        "Test Objective Description"
      )).rejects.toThrow();
    });

    it("should be able to store a big html description", async () => {
      const bigHtmlDescription = "<h1>Test Objective Description</h1>" +
        "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. " +
        "Suspendisse in ipsum ut neque rutrum aliquet. " +
        "Donec auctor, dolor vitae facilisis lacinia, " +
        "nunc libero ultricies velit, id lacinia elit mi sed ipsum. " +
        "Aliquam erat volutpat. Duis sed ipsum eget enim " +
        "tincidunt aliquam. Nulla facilisi. " +
        "Sed sit amet diam sit amet lorem ultricies vestibulum. " +
        "Nulla facilisi. In hac habitasse platea dictumst. " +
        "Nullam aliquam, eros vitae aliquet ultricies, " +
        "nisl massa tincidunt velit, eu viverra ipsum nisi " +
        "et quam. Donec auctor, dolor vitae facilisis lacinia, " +
        "nunc libero ultricies velit, id lacinia elit mi sed ipsum. ";
      const org = await createTestOrg();
      const objective = await service.createObjective(
        org.id,
        "Test Objective",
        bigHtmlDescription
      );
      const storedObjective = await service.findObjectiveById(objective.id);
      expect(storedObjective).toBeDefined();
      expect(storedObjective.title).toEqual(objective.title);
      expect(storedObjective.description).toEqual(objective.description);
      expect(storedObjective.createdAt).toEqual(objective.createdAt);
      expect(storedObjective.updatedAt).toEqual(objective.updatedAt);
    });

    it("should assign the objective to the org", async () => {
      const testOrg = await createTestOrg();
      const objective = await service.createObjective(
        testOrg.id,
        "Test Objective",
        "Test Objective Description"
      );
      const storedObjective = await service.findObjectiveById(objective.id);
      const org = await storedObjective.org;
      expect(org).not.toBeNull();
      expect(org.id).toEqual(testOrg.id);
    });
  });

  describe("when listing objectives", () => {
    it("should return an empty array", async () => {
      const org = await createTestOrg();
      const objectives = await service.list(org.id);
      expect(objectives).toEqual([]);
    });
    it("should return an array of objectives", async () => {
      const org = await createTestOrg();
      await service.createObjective(
        org.id,
        "Test Objective",
        "Test Objective Description"
      );
      const objectives = await service.list(org.id);
      expect(objectives).toHaveLength(1);
      expect(objectives[0].title).toEqual("Test Objective");
    });
  });

  describe("when getting an objective", () => {
    it("should return the objective", async () => {
      const org = await createTestOrg();
      const objective = await service.createObjective(
        org.id,
        "Test Objective",
        "Test Objective Description"
      );
      const storedObjective = await service.get(org.id, objective.id);
      expect(storedObjective).toBeDefined();
      expect(storedObjective.objective.title).toEqual(objective.title);
      expect(storedObjective.objective.description).toEqual(objective.description);
      expect(storedObjective.objective.createdAt).toEqual(objective.createdAt);
      expect(storedObjective.objective.updatedAt).toEqual(objective.updatedAt);
    });
  });

  describe("when updating an objective", () => {
    it("should update the values in db", async () => {
      const org = await createTestOrg();
      const objective = await service.createObjective(
        org.id,
        "Test Objective",
        "Test Objective Description"
      );
      const okrDto = {
        objective: {
          title: "Updated Objective",
          description: "Updated Objective Description"
        }
      };
      await service.update(org.id, objective.id, okrDto);
      const storedObjective = await service.get(org.id, objective.id);
      expect(storedObjective).toBeDefined();
      expect(storedObjective.objective.title).toEqual("Updated Objective");
      expect(storedObjective.objective.description).toEqual("Updated Objective Description");
    });
  });

  describe("when updating an objective with key results", () => {
    it("should update the values in db", async () => {
      const org = await createTestOrg();
      const objective = await service.createObjective(
        org.id,
        "Test Objective",
        "Test Objective Description"
      );
      const okrDto = {
        objective: {
          title: "Updated Objective",
          description: "Updated Objective Description"
        },
        keyResults: [
          { title: "Updated KR 1" },
          { title: "Updated KR 2" },
          { title: "Updated KR 3" }
        ]
      };
      await service.update(org.id, objective.id, okrDto);
      const storedObjective = await service.get(org.id, objective.id);
      expect(storedObjective).toBeDefined();
      expect(storedObjective.objective.title).toEqual("Updated Objective");
      expect(storedObjective.objective.description).toEqual("Updated Objective Description");
      expect(storedObjective.keyResults).toHaveLength(3);
      expect(storedObjective.keyResults[0].title).toEqual("Updated KR 1");
      expect(storedObjective.keyResults[1].title).toEqual("Updated KR 2");
      expect(storedObjective.keyResults[2].title).toEqual("Updated KR 3");
    });
  });

  describe("when deleting an objective", () => {
    it("should delete the objective", async () => {
      const org = await createTestOrg();
      const objective = await service.createObjective(
        org.id,
        "Test Objective",
        "Test Objective Description"
      );
      await service.delete(org.id, objective.id);
      await expect(service.get(org.id, objective.id)).rejects.toThrow();
    });
    it("should delete the key results", async () => {
      const org = await createTestOrg();
      const objective = await service.createObjective(
        org.id,
        "Test Objective",
        "Test Objective Description"
      );
      await service.createKeyResult(objective, "Test Key Result");
      await service.delete(org.id, objective.id);
      await expect(service.get(org.id, objective.id)).rejects.toThrow();
    });
  });

  describe("when creating an OKR", () => {
    it("should return the OKR", async () => {
      const org = await createTestOrg();
      const okr = await service.create(org.id, {
        objective: {
          title: "My OKR",
          description: "My OKR description"
        },
        keyResults: [
          { title: "My KR 1" },
          { title: "My KR 2" },
          { title: "My KR 3" }
        ]
      });
      expect(okr).toBeDefined();
      expect(okr.objective.id).toBeDefined();
      expect(okr.objective.createdAt).toBeDefined();
      expect(okr.objective.updatedAt).toBeDefined();
      expect(okr.objective.title).toEqual("My OKR");
      expect(okr.objective.description).toEqual("My OKR description");
      expect(okr.keyResults).toHaveLength(3);
    });

    it("should store the OKR", async () => {
      const org = await createTestOrg();
      const okr = await service.create(org.id, {
        objective: {
          title: "My OKR",
          description: "My OKR description"
        },
        keyResults: [
          { title: "My KR 1" },
          { title: "My KR 2" },
          { title: "My KR 3" }
        ]
      });
      const storedObjective = await service.get(org.id, okr.objective.id);
      expect(storedObjective).toBeDefined();
      expect(storedObjective.objective.title).toEqual(okr.objective.title);
      expect(storedObjective.objective.description).toEqual(okr.objective.description);
      expect(storedObjective.objective.createdAt).toEqual(okr.objective.createdAt);
      expect(storedObjective.objective.updatedAt).toEqual(okr.objective.updatedAt);
      expect(okr.keyResults).toHaveLength(3);
      expect(okr.keyResults[0].id).toBeDefined();
      expect(okr.keyResults[0].createdAt).toBeDefined();
      expect(okr.keyResults[0].updatedAt).toBeDefined();
      expect(okr.keyResults[0].title).toEqual("My KR 1");
      expect(okr.keyResults[1].id).toBeDefined();
      expect(okr.keyResults[1].createdAt).toBeDefined();
      expect(okr.keyResults[1].updatedAt).toBeDefined();
      expect(okr.keyResults[1].title).toEqual("My KR 2");
      expect(okr.keyResults[2].id).toBeDefined();
      expect(okr.keyResults[2].createdAt).toBeDefined();
      expect(okr.keyResults[2].updatedAt).toBeDefined();
      expect(okr.keyResults[2].title).toEqual("My KR 3");
    });
  });
});
