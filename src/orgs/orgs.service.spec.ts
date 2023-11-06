import { Test, TestingModule } from "@nestjs/testing";
import { OrgsService } from "./orgs.service";
import { Org } from "./org.entity";
import { User } from "../users/user.entity";
import { UsersService } from "../users/users.service";
import { typeOrmModule } from "../../test/typeorm.test-module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";

describe("OrgsService", () => {
  let service: OrgsService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        typeOrmModule,
        TypeOrmModule.forFeature([User, Org]),
        ConfigModule
      ],
      providers: [OrgsService, UsersService]
    }).compile();

    service = module.get<OrgsService>(OrgsService);
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(async () => {
    await service.clear();
    await usersService.clear();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should create an org", async () => {
    const user = new User("Test User", "test@example.com", "testtesttest");
    const org = await service.createForUser(user);
    expect(org).toBeInstanceOf(Org);
    expect(org.id).toBeDefined();
  });
});
