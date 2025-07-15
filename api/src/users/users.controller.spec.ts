import { UsersController } from './users.controller';
import { Org } from '../orgs/org.entity';
import { setupTestingModule } from '../../test/test.utils';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrgsService } from '../orgs/orgs.service';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { AuthGuard } from '../auth/auth.guard';
import { TokensService } from '../auth/tokens.service';
import { UserRole } from './enums';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;
  let cleanup: () => Promise<void>;
  let user: User;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [TypeOrmModule.forFeature([Org, User])],
      [UsersService, OrgsService, AuthGuard, TokensService],
      [UsersController],
    );
    cleanup = dbCleanup;
    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
    user = await usersService.createUserWithOrg(
      'Test User',
      'test@example.com',
      'testtesttest',
    );
  });

  afterEach(async () => {
    await cleanup();
  });

  describe('when getting the current user', () => {
    it('should return the user', async () => {
      const currentUser = await controller.getCurrentUser({
        user: { sub: user.id },
      });
      expect(currentUser).toBeDefined();
    });
  });

  describe('when patching the current user', () => {
    it('should return the user', async () => {
      const currentUser = await controller.patchCurrentUser(
        {
          user: { sub: user.id },
        },
        {
          name: 'New Name',
        },
      );
      expect(currentUser).toBeDefined();
      expect(currentUser.name).toEqual('New Name');
    });
  });

  describe("when updating the user's role", () => {
    it('should update the user role', async () => {
      const user = await usersService.createUserWithOrg(
        'Test User',
        'test1@example.com',
        'testtesttest',
      );
      const org = await user.org;
      const secondUser = await usersService.createUser(
        'Second User',
        'test2@example.com',
        'testtesttest',
        org,
      );
      await controller.changeRole(
        { user: { sub: user.id, org: org.id } },
        secondUser.id,
        { role: 'admin' },
      );
      const foundUser = await usersService.findOne(user.id);
      expect(foundUser.role).toEqual(UserRole.ADMIN);
    });
  });

  describe('when getting the MCP token', () => {
    it('should return the MCP token', async () => {
      const mcpToken = await controller.getMcpToken({
        user: { sub: user.id },
      });
      expect(mcpToken).toBeDefined();
      expect(mcpToken).toEqual(user.mcpToken);
    });
  });

  describe('when regenerating the MCP token', () => {
    it('should return a new MCP token', async () => {
      const oldToken = user.mcpToken;
      const newToken = await controller.refreshMcpToken({
        user: { sub: user.id },
      });
      expect(newToken).toBeDefined();
      expect(newToken).not.toEqual(oldToken);
    });
  });
});
