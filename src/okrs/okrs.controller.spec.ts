import { OkrsController } from "./okrs.controller";
import { setupTestingModule } from "../../test/test.utils";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Objective } from "./objective.entity";
import { OkrsService } from "./okrs.service";

describe("OkrsController", () => {
  let controller: OkrsController;
  let cleanup: () => Promise<void>;
  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [TypeOrmModule.forFeature([Objective])],
      [OkrsService],
      [OkrsController]
    );
    cleanup = dbCleanup;
    controller = module.get<OkrsController>(OkrsController);
  });

  afterEach(async () => {
    await cleanup();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("when creating an OKR", () => {
    it("should return the created OKR", async () => {
      const okr = await controller.create({
        objective: {
          objective: "My OKR",
          description: "My OKR description"
        }
      });
      expect(okr.objective.objective).toEqual("My OKR");
      expect(okr.objective.description).toEqual("My OKR description");
    });
    it("should validate the OKR", async () => {
      await expect(controller.create({
        objective: {
          objective: "",
          description: "My OKR description"
        }
      })).rejects.toThrow();
    });
  });
});
