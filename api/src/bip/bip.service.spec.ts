import { BipService } from './bip.service';
import { UsersService } from '../users/users.service';
import { OrgsService } from '../orgs/orgs.service';
import { Org } from '../orgs/org.entity';
import { User } from '../users/user.entity';
import { setupTestingModule } from '../../test/test.utils';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { TokensService } from '../auth/tokens.service';
import { BipSettings } from './bip-settings.entity';
import { PaymentPlan } from '../auth/payment.plan';
import { Repository } from 'typeorm';
import { Project } from '../projects/project.entity';

describe('BipService', () => {
  let service: BipService;
  let orgsService: OrgsService;
  let usersService: UsersService;
  let user: User;
  let org: Org;
  let project: Project;
  let orgsRepository: Repository<Org>;

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
    orgsRepository = module.get<Repository<Org>>(getRepositoryToken(Org));
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

  describe('updateSettings', () => {
    it('should update the settings', async () => {
      const settings = {
        isBuildInPublicEnabled: true,
        isObjectivesPagePublic: true,
        isRoadmapPagePublic: true,
        isIterationsPagePublic: true,
        isActiveIterationsPagePublic: true,
        isFeedPagePublic: true,
        isIssuesPagePublic: true,
        isFeatureRequestsPagePublic: true,
      };
      await service.createOrUpdateSettings(org.id, project.id, settings);
      const updatedSettings = await service.getSettings(org.id, project.id);
      expect(updatedSettings).toEqual(settings);
    });
    it('should update the settings if the org is premium', async () => {
      org.paymentPlan = PaymentPlan.PREMIUM;
      await orgsRepository.save(org);
      const settings = {
        isBuildInPublicEnabled: true,
        isObjectivesPagePublic: true,
        isRoadmapPagePublic: true,
        isIterationsPagePublic: true,
        isActiveIterationsPagePublic: true,
        isFeedPagePublic: true,
        isIssuesPagePublic: true,
        isFeatureRequestsPagePublic: true,
      };
      await service.createOrUpdateSettings(org.id, project.id, settings);
      const updatedSettings = await service.getSettings(org.id, project.id);
      expect(updatedSettings).toEqual(settings);
    });
  });

  describe('createSettings', () => {
    it('should create the default building in public settings on org created event', async () => {
      await service.createSettings(org);
      const settings = await service.getSettings(org.id, project.id);
      expect(settings).toEqual({
        isBuildInPublicEnabled: false,
        isObjectivesPagePublic: false,
        isRoadmapPagePublic: false,
        isIterationsPagePublic: false,
        isActiveIterationsPagePublic: false,
        isFeedPagePublic: false,
        isIssuesPagePublic: false,
        isFeatureRequestsPagePublic: false,
      });
    });
    it('should create the default building in public settings on org created event when the org is premium', async () => {
      org.paymentPlan = PaymentPlan.PREMIUM;
      await orgsRepository.save(org);
      await service.createSettings(org);
      const settings = await service.getSettings(org.id, project.id);
      expect(settings).toEqual({
        isBuildInPublicEnabled: false,
        isObjectivesPagePublic: false,
        isRoadmapPagePublic: false,
        isIterationsPagePublic: false,
        isActiveIterationsPagePublic: false,
        isFeedPagePublic: false,
        isIssuesPagePublic: false,
        isFeatureRequestsPagePublic: false,
      });
    });
    it('should not override existing settings', async () => {
      const settings = {
        isBuildInPublicEnabled: true,
        isObjectivesPagePublic: true,
        isRoadmapPagePublic: true,
        isIterationsPagePublic: true,
        isActiveIterationsPagePublic: true,
        isFeedPagePublic: true,
        isIssuesPagePublic: true,
        isFeatureRequestsPagePublic: true,
      };
      await service.createOrUpdateSettings(org.id, project.id, settings);
      await service.createSettings(org);
      const updatedSettings = await service.getSettings(org.id, project.id);
      expect(updatedSettings).toEqual(settings);
    });
    it('should not throw an error if settings already exist', async () => {
      const settings = {
        isBuildInPublicEnabled: true,
        isObjectivesPagePublic: true,
        isRoadmapPagePublic: true,
        isIterationsPagePublic: true,
        isActiveIterationsPagePublic: true,
        isFeedPagePublic: true,
        isIssuesPagePublic: true,
        isFeatureRequestsPagePublic: true,
      };
      await service.createOrUpdateSettings(org.id, project.id, settings);
      await expect(service.createSettings(org)).resolves.not.toThrow();
    });
    it('should not throw an error if org does not exist', async () => {
      await expect(service.createSettings(new Org())).resolves.not.toThrow();
    });
  });
});
