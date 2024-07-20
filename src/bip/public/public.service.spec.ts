import { PublicService } from './public.service';
import { OrgsService } from '../../orgs/orgs.service';
import { UsersService } from '../../users/users.service';
import { User } from '../../users/user.entity';
import { Org } from '../../orgs/org.entity';
import { setupTestingModule } from '../../../test/test.utils';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BipSettings } from '../bip-settings.entity';
import { TokensService } from '../../auth/tokens.service';
import { BipService } from '../bip.service';

describe('PublicService', () => {
  let service: PublicService;
  let orgsService: OrgsService;
  let usersService: UsersService;
  let user: User;
  let org: Org;
  let bipService: BipService;

  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [TypeOrmModule.forFeature([Org, BipSettings])],
      [PublicService, OrgsService, TokensService, UsersService, BipService],
    );
    cleanup = dbCleanup;
    service = module.get<PublicService>(PublicService);
    orgsService = module.get<OrgsService>(OrgsService);
    usersService = module.get<UsersService>(UsersService);
    bipService = module.get<BipService>(BipService);
    user = await usersService.createUserWithOrg(
      'Test User',
      'test@example.com',
      'testtesttest',
    );
    org = await orgsService.createForUser(user);
    await bipService.createSettings(org);
  });

  afterEach(async () => {
    await cleanup();
  });

  describe('getPublicSettings', () => {
    it('should return the public settings', async () => {
      const settings = await service.getPublicSettings(org.id);
      expect(settings).toEqual({
        isBuildInPublicEnabled: false,
        isObjectivesPagePublic: false,
        isRoadmapPagePublic: false,
        isIterationsPagePublic: false,
        isActiveIterationsPagePublic: false,
        isFeedPagePublic: false,
      });
    });
  });
});
