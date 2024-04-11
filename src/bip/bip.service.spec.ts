import { BipService } from './bip.service';
import { UsersService } from '../users/users.service';
import { OrgsService } from '../orgs/orgs.service';
import { Org } from '../orgs/org.entity';
import { User } from '../users/user.entity';
import { setupTestingModule } from '../../test/test.utils';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokensService } from '../auth/tokens.service';
import { BipSettings } from './bip-settings.entity';

describe('BipService', () => {
  let service: BipService;
  let orgsService: OrgsService;
  let usersService: UsersService;
  let user: User;
  let org: Org;

  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [TypeOrmModule.forFeature([Org, BipSettings])],
      [BipService, OrgsService, TokensService, UsersService],
    );
    cleanup = dbCleanup;
    service = module.get<BipService>(BipService);
    orgsService = module.get<OrgsService>(OrgsService);
    usersService = module.get<UsersService>(UsersService);
    user = await usersService.createUserWithOrg(
      'Test User',
      'test@example.com',
      'testtesttest',
    );
    org = await orgsService.createForUser(user);
  });

  afterEach(async () => {
    await cleanup();
  });

  describe('updateSettings', () => {
    it('should update the settings', async () => {
      const settings = {
        isBuildInPublicEnabled: true,
        isObjectivesPagePublic: true,
        isRoadmapPagePublic: true,
        isIterationsPagePublic: true,
        isActiveIterationsPagePublic: true,
      };
      await service.createOrUpdateSettings(org.id, settings);
      const updatedSettings = await service.getSettings(org.id);
      expect(updatedSettings).toEqual(settings);
    });
  });
});
