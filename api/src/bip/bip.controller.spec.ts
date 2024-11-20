import { BipController } from './bip.controller';
import { Org } from '../orgs/org.entity';
import { User } from '../users/user.entity';
import { setupTestingModule } from '../../test/test.utils';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { OrgsService } from '../orgs/orgs.service';
import { TokensService } from '../auth/tokens.service';
import { UsersService } from '../users/users.service';
import { BipService } from './bip.service';
import { BipSettings } from './bip-settings.entity';
import { Project } from '../projects/project.entity';

describe('BipController', () => {
  let controller: BipController;
  let cleanup: () => Promise<void>;
  let org: Org;
  let user: User;
  let project: Project;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [TypeOrmModule.forFeature([Org, BipSettings]), UsersModule],
      [OrgsService, BipService, TokensService],
      [BipController],
    );
    cleanup = dbCleanup;
    controller = module.get<BipController>(BipController);
    const orgsService = module.get<OrgsService>(OrgsService);
    const usersService = module.get<UsersService>(UsersService);
    user = await usersService.createUserWithOrg(
      'Test User',
      'test@example.com',
      'testtesttest',
    );
    org = await orgsService.createForUser(user);
    project = (await org.projects)[0];
  });

  afterEach(async () => {
    await cleanup();
  });

  describe('when updating BIP settings', () => {
    it('should update BIP settings', async () => {
      const updatedSettings = await controller.createOrUpdateSettings(
        org.id,
        project.id,
        {
          user: {
            org: org.id,
          },
        },
        {
          isBuildInPublicEnabled: true,
          isObjectivesPagePublic: true,
          isRoadmapPagePublic: true,
          isIterationsPagePublic: true,
          isActiveIterationsPagePublic: true,
          isFeedPagePublic: true,
          isIssuesPagePublic: true,
          isFeatureRequestsPagePublic: true,
        },
      );
      expect(updatedSettings).toEqual({
        isBuildInPublicEnabled: true,
        isObjectivesPagePublic: true,
        isRoadmapPagePublic: true,
        isIterationsPagePublic: true,
        isActiveIterationsPagePublic: true,
        isFeedPagePublic: true,
        isIssuesPagePublic: true,
        isFeatureRequestsPagePublic: true,
      });
    });
  });

  describe('when getting BIP settings', () => {
    it('should return BIP settings', async () => {
      await controller.createOrUpdateSettings(
        org.id,
        project.id,
        {
          user: {
            org: org.id,
          },
        },
        {
          isBuildInPublicEnabled: true,
          isObjectivesPagePublic: true,
          isRoadmapPagePublic: true,
          isIterationsPagePublic: true,
          isActiveIterationsPagePublic: true,
          isFeedPagePublic: true,
          isIssuesPagePublic: true,
          isFeatureRequestsPagePublic: true,
        },
      );
      const settings = await controller.getSettings(org.id, project.id);
      expect(settings).toEqual({
        isBuildInPublicEnabled: true,
        isObjectivesPagePublic: true,
        isRoadmapPagePublic: true,
        isIterationsPagePublic: true,
        isActiveIterationsPagePublic: true,
        isFeedPagePublic: true,
        isIssuesPagePublic: true,
        isFeatureRequestsPagePublic: true,
      });
    });
  });
});
