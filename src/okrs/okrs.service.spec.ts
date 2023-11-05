import { Test, TestingModule } from "@nestjs/testing";
import { OkrsService } from "./okrs.service";

describe("OkrsService", () => {
  let service: OkrsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OkrsService]
    }).compile();

    service = module.get<OkrsService>(OkrsService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
