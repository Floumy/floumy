import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { setupTestingModule } from "../test/test.utils";

describe("AppController", () => {
  let appController: AppController;
  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [],
      [AppService],
      [AppController]
    );
    cleanup = dbCleanup;
    appController = module.get<AppController>(AppController);
  });

  afterEach(async () => {
    await cleanup();
  });

  describe("root", () => {
    it("should return \"Hello World!\"", () => {
      expect(appController.getHello()).toBe("Hello World!");
    });
  });
});
