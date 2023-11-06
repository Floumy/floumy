import { OkrsController } from "./okrs.controller";
import { setupTestingModule } from "../../test/test.utils";

describe("OkrsController", () => {
  let controller: OkrsController;
  let cleanup: () => Promise<void>;
  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [],
      [],
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
        title: "My OKR",
        description: "My OKR description"
      });
      expect(okr.title).toEqual("My OKR");
      expect(okr.description).toEqual("My OKR description");
    });
  });
});
