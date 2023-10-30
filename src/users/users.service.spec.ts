import { Test, TestingModule } from "@nestjs/testing";
import { UsersService } from "./users.service";
import { JwtModule } from "@nestjs/jwt";

describe("UsersService", () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          global: true,
          secret: "secret",
          signOptions: { expiresIn: "60s" }
        })
      ],
      providers: [UsersService]
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
