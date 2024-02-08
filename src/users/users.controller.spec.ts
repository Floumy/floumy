import { UsersController } from "./users.controller";
import { Org } from "../orgs/org.entity";
import { setupTestingModule } from "../../test/test.utils";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OrgsService } from "../orgs/orgs.service";
import { UsersService } from "./users.service";
import { User } from "./user.entity";
import { AuthGuard } from "../auth/auth.guard";
import { TokensService } from "../auth/tokens.service";

describe("UsersController", () => {
  let controller: UsersController;
  let cleanup: () => Promise<void>;
  let user: User;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [TypeOrmModule.forFeature([Org, User])],
      [UsersService, OrgsService, AuthGuard, TokensService],
      [UsersController]
    );
    cleanup = dbCleanup;
    controller = module.get<UsersController>(UsersController);
    const usersService = module.get<UsersService>(UsersService);
    user = await usersService.create(
      "Test User",
      "test@example.com",
      "testtesttest"
    );
  });

  afterEach(async () => {
    await cleanup();
  });

  describe("when getting the current user", () => {
    it("should return the user", async () => {
      const currentUser = await controller.getCurrentUser({ user: { sub: user.id } });
      expect(currentUser).toBeDefined();
    });
  });
});
