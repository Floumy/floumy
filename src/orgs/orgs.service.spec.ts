import { OrgsService } from "./orgs.service";
import { Org } from "./org.entity";
import { User } from "../users/user.entity";
import { UsersService } from "../users/users.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { setupTestingModule } from "../../test/test.utils";

describe("OrgsService", () => {
  let service: OrgsService;
  let usersService: UsersService;
  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [TypeOrmModule.forFeature([Org, User])],
      [OrgsService, UsersService]
    );
    service = module.get<OrgsService>(OrgsService);
    usersService = module.get<UsersService>(UsersService);
    cleanup = dbCleanup;
  });

  afterEach(async () => {
    await cleanup();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should create an org", async () => {
    const user = new User("Test User", "test@example.com", "testtesttest");
    const org = await service.createForUser(user);
    expect(org).toBeInstanceOf(Org);
    expect(org.id).toBeDefined();
    expect(await org.users).toHaveLength(1);
  });

  it("should fetch an org by id", async () => {
    const user = new User("Test User", "test@example.com", "testtesttest");
    const org = await service.createForUser(user);
    const fetchedOrg = await service.findOneById(org.id);
    expect(fetchedOrg).not.toBeNull();
    expect(fetchedOrg.id).toEqual(org.id);
  });
});
