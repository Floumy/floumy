import { PublicController } from './public.controller';
import { Org } from '../../orgs/org.entity';
import { setupTestingModule } from '../../../test/test.utils';
import { BipSettings } from '../bip-settings.entity';
import { UsersModule } from '../../users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrgsService } from '../../orgs/orgs.service';
import { BipService } from '../bip.service';
import { TokensService } from '../../auth/tokens.service';
import { UsersService } from '../../users/users.service';
import { User } from '../../users/user.entity';
import { PublicService } from './public.service';

describe('PublicController', () => {
  let controller: PublicController;
  let cleanup: () => Promise<void>;
  let org: Org;
  let user: User;
  let bipService: BipService;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [TypeOrmModule.forFeature([Org, BipSettings]), UsersModule],
      [OrgsService, BipService, TokensService, PublicService],
      [PublicController],
    );
    cleanup = dbCleanup;
    controller = module.get<PublicController>(PublicController);
    const orgsService = module.get<OrgsService>(OrgsService);
    const usersService = module.get<UsersService>(UsersService);
    user = await usersService.createUserWithOrg(
      'Test User',
      'test@example.com',
      'testtesttest',
    );
    org = await orgsService.createForUser(user);
    bipService = module.get<BipService>(BipService);
    await bipService.createSettings(org);
  });

  afterEach(async () => {
    await cleanup();
  });

  describe('when getting the public settings', () => {
    it('should return the public settings', async () => {
      const settings = await controller.getPublicSettings(org.id);
      expect(settings).toEqual({
        isBuildInPublicEnabled: false,
        isObjectivesPagePublic: false,
        isRoadmapPagePublic: false,
        isIterationsPagePublic: false,
        isActiveIterationsPagePublic: false,
        isFeedPagePublic: false,
      });
    });
    it('should throw an error if the org does not exist', async () => {
      await expect(
        controller.getPublicSettings('invalid-id'),
      ).rejects.toThrow();
    });
  });
});
