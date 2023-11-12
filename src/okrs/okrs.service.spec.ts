import { OkrsService } from "./okrs.service";
import { setupTestingModule } from "../../test/test.utils";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Objective } from "./objective.entity";
import { OrgsService } from "../orgs/orgs.service";
import { User } from "../users/user.entity";
import { Org } from "../orgs/org.entity";

describe("OkrsService", () => {
  let service: OkrsService;
  let orgsService: OrgsService;
  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [TypeOrmModule.forFeature([Objective, Org])],
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
      expect(storedObjective.objective).toEqual(objective.objective);
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
      expect(storedObjective.objective).toEqual(objective.objective);
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
      expect(objectives[0].objective).toEqual("Test Objective");
      expect(objectives[0].description).toEqual("Test Objective Description");
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
      expect(storedObjective.objective).toEqual(objective.objective);
      expect(storedObjective.description).toEqual(objective.description);
      expect(storedObjective.createdAt).toEqual(objective.createdAt);
      expect(storedObjective.updatedAt).toEqual(objective.updatedAt);
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
      await service.update(org.id, objective.id, "Updated Objective", "Updated Objective Description");
      const storedObjective = await service.get(org.id, objective.id);
      expect(storedObjective).toBeDefined();
      expect(storedObjective.objective).toEqual("Updated Objective");
      expect(storedObjective.description).toEqual("Updated Objective Description");
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
  });
});
