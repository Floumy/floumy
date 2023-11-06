import { OkrsService } from "./okrs.service";
import { setupTestingModule } from "../../test/test.utils";

describe("OkrsService", () => {
  let service: OkrsService;
  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [],
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

});
