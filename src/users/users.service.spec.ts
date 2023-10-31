import { Test, TestingModule } from "@nestjs/testing";
import { UsersService } from "./users.service";
import { jwtModule } from "../../test/jwt.test-module";

describe("UsersService", () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        jwtModule
      ],
      providers: [UsersService]
    }).compile();
    service = module.get<UsersService>(UsersService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
