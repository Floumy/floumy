import { Test, TestingModule } from "@nestjs/testing";
import { OkrsController } from "./okrs.controller";

describe("OkrsController", () => {
  let controller: OkrsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OkrsController]
    }).compile();

    controller = module.get<OkrsController>(OkrsController);
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
