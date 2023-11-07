import { OkrsService } from "./okrs.service";
import { setupTestingModule } from "../../test/test.utils";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Objective } from "./objective.entity";

describe("OkrsService", () => {
  let service: OkrsService;
  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [TypeOrmModule.forFeature([Objective])],
      [OkrsService]
    );
    cleanup = dbCleanup;
    service = module.get<OkrsService>(OkrsService);
  });

  afterEach(async () => {
    await cleanup();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("when creating an objective", () => {
    it("should return the objective", async () => {
      const objective = await service.createObjective(
        "Test Objective",
        "Test Objective Description"
      );
      expect(objective).toBeDefined();
      expect(objective.id).toBeDefined();
      expect(objective.createdAt).toBeDefined();
      expect(objective.updatedAt).toBeDefined();
    });
    it("should store the objective", async () => {
      const objective = await service.createObjective(
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
      await expect(service.createObjective(
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

      const objective = await service.createObjective(
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
  });
});
