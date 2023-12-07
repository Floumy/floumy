import { OkrsService } from "./okrs.service";
import { setupTestingModule } from "../../test/test.utils";
import { getRepositoryToken, TypeOrmModule } from "@nestjs/typeorm";
import { Objective } from "./objective.entity";
import { OrgsService } from "../orgs/orgs.service";
import { User } from "../users/user.entity";
import { Org } from "../orgs/org.entity";
import { KeyResult } from "./key-result.entity";
import { Repository } from "typeorm";
import { Feature } from "../roadmap/features/feature.entity";

describe("OkrsService", () => {
  let service: OkrsService;
  let orgsService: OrgsService;
  let featuresRepository: Repository<Feature>;
  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [TypeOrmModule.forFeature([Objective, Org, KeyResult, Feature])],
      [OkrsService, OrgsService]
    );
    cleanup = dbCleanup;
    service = module.get<OkrsService>(OkrsService);
    orgsService = module.get<OrgsService>(OrgsService);
    featuresRepository = module.get<Repository<Feature>>(getRepositoryToken(Feature));
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
        { title: "Test Objective" }
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
        { title: "Test Objective" }
      );
      const storedObjective = await service.findObjectiveById(objective.id);
      expect(storedObjective).toBeDefined();
      expect(storedObjective.title).toEqual(objective.title);
      expect(storedObjective.createdAt).toEqual(objective.createdAt);
      expect(storedObjective.updatedAt).toEqual(objective.updatedAt);
    });

    it("should validate the objective", async () => {
      const org = await createTestOrg();
      await expect(service.createObjective(
        org.id,
        { title: "" }
      )).rejects.toThrow();
    });

    it("should assign the objective to the org", async () => {
      const testOrg = await createTestOrg();
      const objective = await service.createObjective(
        testOrg.id,
        { title: "Test Objective" }
      );
      const storedObjective = await service.findObjectiveById(objective.id);
      const org = await storedObjective.org;
      expect(org).not.toBeNull();
      expect(org.id).toEqual(testOrg.id);
    });

    it("should validate the timeline", async () => {
      const org = await createTestOrg();
      await expect(service.createObjective(
        org.id,
        { title: "Test Objective", timeline: "invalid" }
      )).rejects.toThrow();
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
        { title: "Test Objective" }
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
        { title: "Test Objective" }
      );
      const storedObjective = await service.get(org.id, objective.id);
      expect(storedObjective).toBeDefined();
      expect(storedObjective.objective.title).toEqual(objective.title);
      expect(storedObjective.objective.createdAt).toEqual(objective.createdAt);
      expect(storedObjective.objective.updatedAt).toEqual(objective.updatedAt);
    });
  });

  describe("when updating an objective", () => {
    it("should update the values in db", async () => {
      const org = await createTestOrg();
      const objective = await service.createObjective(
        org.id,
        { title: "Test Objective" }
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
    });
    it("should update objective timeline", async () => {
      const org = await createTestOrg();
      const objective = await service.createObjective(
        org.id,
        { title: "Test Objective" }
      );
      const okrDto = {
        objective: {
          title: "Updated Objective",
          description: "Updated Objective Description",
          timeline: "this-quarter"
        }
      };
      await service.update(org.id, objective.id, okrDto);
      const storedObjective = await service.get(org.id, objective.id);
      expect(storedObjective).toBeDefined();
      expect(storedObjective.objective.timeline).toEqual("this-quarter");
    });
  });

  describe("when updating an objective with key results", () => {
    it("should update the values in db", async () => {
      const org = await createTestOrg();
      const objective = await service.createObjective(
        org.id,
        { title: "Test Objective" }
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
      expect(storedObjective.keyResults).toHaveLength(3);
      expect(storedObjective.keyResults[0].title).toEqual("Updated KR 1");
      expect(storedObjective.keyResults[1].title).toEqual("Updated KR 2");
      expect(storedObjective.keyResults[2].title).toEqual("Updated KR 3");
    });
    it("should update objective progress", async () => {
      const org = await createTestOrg();
      const okr = await service.create(
        org.id,
        {
          objective: {
            title: "Test Objective"
          },
          keyResults: [
            { title: "KR 1" },
            { title: "KR 2" },
            { title: "KR 3" }
          ]
        }
      );
      await service.patchKeyResult(org.id, okr.objective.id, okr.keyResults[0].id, { progress: 0.5 });
      await service.patchKeyResult(org.id, okr.objective.id, okr.keyResults[1].id, { progress: 0.5 });
      await service.patchKeyResult(org.id, okr.objective.id, okr.keyResults[2].id, { progress: 0.5 });
      await service.update(org.id, okr.objective.id, {
        objective: {
          title: "Updated Objective"
        },
        keyResults: [
          { id: okr.keyResults[0].id, title: "Updated KR 1" },
          { id: okr.keyResults[1].id, title: "Updated KR 2" },
          { title: "New KR 4" },
          { title: "New KR 5" }
        ]
      });
      const storedOkr = await service.get(org.id, okr.objective.id);
      expect(storedOkr.objective.progress).toEqual(0.25);
    });
  });

  describe("when deleting an objective", () => {
    it("should delete the objective", async () => {
      const org = await createTestOrg();
      const objective = await service.createObjective(
        org.id,
        { title: "Test Objective" }
      );
      await service.delete(org.id, objective.id);
      await expect(service.get(org.id, objective.id)).rejects.toThrow();
    });
    it("should delete the key results", async () => {
      const org = await createTestOrg();
      const objective = await service.createObjective(
        org.id,
        { title: "Test Objective" }
      );
      await service.createKeyResult(objective, "Test Key Result");
      await service.delete(org.id, objective.id);
      await expect(service.get(org.id, objective.id)).rejects.toThrow();
    });
    it("should remove the key results from the associated feature", async () => {
      const org = await createTestOrg();
      const objective = await service.createObjective(
        org.id,
        {
          title: "Test Objective",
          timeline: "this-quarter"
        }
      );
      const keyResult = await service.createKeyResult(objective, "Test Key Result");
      const feature = new Feature();
      feature.org = Promise.resolve(org);
      feature.title = "Test Feature";
      feature.description = "";
      feature.keyResult = Promise.resolve(keyResult);
      await featuresRepository.save(feature);
      await service.delete(org.id, objective.id);
      const storedFeature = await featuresRepository.findOne({ where: { id: feature.id } });
      expect(storedFeature).toBeDefined();
      expect(await storedFeature.keyResult).toBeNull();
    });
  });

  describe("when creating an OKR", () => {
    it("should return the OKR", async () => {
      const org = await createTestOrg();
      const okr = await service.create(org.id, {
        objective: {
          title: "My OKR"
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
      expect(okr.keyResults).toHaveLength(3);
    });

    it("should store the OKR", async () => {
      const org = await createTestOrg();
      const okr = await service.create(org.id, {
        objective: {
          title: "My OKR"
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
  describe("when updating a KR progress", () => {
    it("should update the KR progress", async () => {
      const org = await createTestOrg();
      const okr = await service.create(org.id, {
        objective: {
          title: "My OKR"
        },
        keyResults: [
          { title: "My KR 1" },
          { title: "My KR 2" },
          { title: "My KR 3" }
        ]
      });
      await service.patchKeyResult(org.id, okr.objective.id, okr.keyResults[0].id, { progress: 0.5 });
      const updatedKR = await service.getKeyResult(okr.keyResults[0].id);
      expect(updatedKR.progress).toEqual(0.5);
    });
    it("should update the objective progress", async () => {
      const org = await createTestOrg();
      const okr = await service.create(org.id, {
        objective: {
          title: "My OKR"
        },
        keyResults: [
          { title: "My KR 1" },
          { title: "My KR 2" },
          { title: "My KR 3" }
        ]
      });
      await service.patchKeyResult(org.id, okr.objective.id, okr.keyResults[0].id, { progress: 0.5 });
      await service.patchKeyResult(org.id, okr.objective.id, okr.keyResults[1].id, { progress: 0.5 });
      await service.patchKeyResult(org.id, okr.objective.id, okr.keyResults[2].id, { progress: 0.5 });
      const updatedObjective = await service.getObjective(okr.objective.id);
      expect(updatedObjective.progress).toEqual(0.5);
    });
  });
  describe("when updating the objective status", () => {
    it("should update the objective status", async () => {
      const org = await createTestOrg();
      const okr = await service.create(org.id, {
        objective: {
          title: "My OKR"
        },
        keyResults: [
          { title: "My KR 1" },
          { title: "My KR 2" },
          { title: "My KR 3" }
        ]
      });
      await service.patchObjective(org.id, okr.objective.id, { status: "off-track" });
      const updatedObjective = await service.getObjective(okr.objective.id);
      expect(updatedObjective.status).toEqual("off-track");
    });
  });
  describe("when updating the key result status", () => {
    it("should update the key result status", async () => {
      const org = await createTestOrg();
      const okr = await service.create(org.id, {
        objective: {
          title: "My OKR"
        },
        keyResults: [
          { title: "My KR 1" },
          { title: "My KR 2" },
          { title: "My KR 3" }
        ]
      });
      await service.patchKeyResult(org.id, okr.objective.id, okr.keyResults[0].id, { status: "off-track" });
      const updatedKR = await service.getKeyResult(okr.keyResults[0].id);
      expect(updatedKR.status).toEqual("off-track");
    });
  });
  describe("when listing key results", () => {
    it("should return an empty array", async () => {
      const org = await createTestOrg();
      const keyResults = await service.listKeyResults(org.id);
      expect(keyResults).toEqual([]);
    });
    it("should return an array of key results", async () => {
      const org = await createTestOrg();
      const objective = await service.createObjective(
        org.id,
        { title: "Test Objective" }
      );
      await service.createKeyResult(objective, "Test Key Result");
      const keyResults = await service.listKeyResults(org.id);
      expect(keyResults).toHaveLength(1);
      expect(keyResults[0].title).toEqual("Test Key Result");
    });
  });
});
