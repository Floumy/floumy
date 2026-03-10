import { BipService } from './bip.service';
import { UsersService } from '../users/users.service';
import { OrgsService } from '../orgs/orgs.service';
import { Org } from '../orgs/org.entity';
import { User } from '../users/user.entity';
import { setupTestingModule } from '../../test/test.utils';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { TokensService } from '../auth/tokens.service';
import { BipSettings } from './bip-settings.entity';
import { Repository } from 'typeorm';
import { Project } from '../projects/project.entity';
import { NotFoundException } from '@nestjs/common';

describe('BipService', () => {
  let service: BipService;
  let orgsService: OrgsService;
  let usersService: UsersService;
  let user: User;
  let org: Org;
  let project: Project;
  let orgsRepository: Repository<Org>;
  let projectsRepository: Repository<Project>;

  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [TypeOrmModule.forFeature([Org, BipSettings])],
      [BipService, OrgsService, TokensService, UsersService, Project],
    );
    cleanup = dbCleanup;
    service = module.get<BipService>(BipService);
    orgsService = module.get<OrgsService>(OrgsService);
    usersService = module.get<UsersService>(UsersService);
    orgsRepository = module.get<Repository<Org>>(getRepositoryToken(Org));
    projectsRepository = module.get<Repository<Project>>(
      getRepositoryToken(Project),
    );
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
        isCyclesPagePublic: true,
        isActiveCyclesPagePublic: true,
        isActiveWorkPagePublic: true,
        isRequestsPagePublic: true,
        isIssuesPagePublic: true,
      };
      await service.createOrUpdateSettings(org.id, project.id, settings);
      const updatedSettings = await service.getSettings(org.id, project.id);
      expect(updatedSettings).toEqual(settings);
    });
    it('should update the settings if the org is premium', async () => {
      await orgsRepository.save(org);
      const settings = {
        isBuildInPublicEnabled: true,
        isObjectivesPagePublic: true,
        isRoadmapPagePublic: true,
        isCyclesPagePublic: true,
        isActiveCyclesPagePublic: true,
        isActiveWorkPagePublic: true,
        isRequestsPagePublic: true,
        isIssuesPagePublic: true,
      };
      await service.createOrUpdateSettings(org.id, project.id, settings);
      const updatedSettings = await service.getSettings(org.id, project.id);
      expect(updatedSettings).toEqual(settings);
    });
  });

  describe('createSettings', () => {
    it('should create the default building in public settings on org created event', async () => {
      await service.createSettings(project);
      const settings = await service.getSettings(org.id, project.id);
      expect(settings).toEqual({
        isBuildInPublicEnabled: false,
        isObjectivesPagePublic: false,
        isRoadmapPagePublic: false,
        isCyclesPagePublic: false,
        isActiveCyclesPagePublic: false,
        isActiveWorkPagePublic: false,
        isIssuesPagePublic: false,
        isRequestsPagePublic: false,
      });
    });
    it('should create the default building in public settings on org created event when the org is premium', async () => {
      await orgsRepository.save(org);
      await service.createSettings(project);
      const settings = await service.getSettings(org.id, project.id);
      expect(settings).toEqual({
        isBuildInPublicEnabled: false,
        isObjectivesPagePublic: false,
        isRoadmapPagePublic: false,
        isCyclesPagePublic: false,
        isActiveCyclesPagePublic: false,
        isActiveWorkPagePublic: false,
        isIssuesPagePublic: false,
        isRequestsPagePublic: false,
      });
    });
    it('should not override existing settings', async () => {
      const settings = {
        isBuildInPublicEnabled: true,
        isObjectivesPagePublic: true,
        isRoadmapPagePublic: true,
        isCyclesPagePublic: true,
        isActiveCyclesPagePublic: true,
        isActiveWorkPagePublic: true,
        isRequestsPagePublic: true,
        isIssuesPagePublic: true,
      };
      await service.createOrUpdateSettings(org.id, project.id, settings);
      await service.createSettings(project);
      const updatedSettings = await service.getSettings(org.id, project.id);
      expect(updatedSettings).toEqual(settings);
    });
    it('should not throw an error if settings already exist', async () => {
      const settings = {
        isBuildInPublicEnabled: true,
        isObjectivesPagePublic: true,
        isRoadmapPagePublic: true,
        isCyclesPagePublic: true,
        isActiveCyclesPagePublic: true,
        isActiveWorkPagePublic: true,
        isRequestsPagePublic: true,
        isIssuesPagePublic: true,
      };
      await service.createOrUpdateSettings(org.id, project.id, settings);
      await expect(service.createSettings(project)).resolves.not.toThrow();
    });
    it('should not throw an error if org does not exist', async () => {
      await expect(
        service.createSettings(new Project()),
      ).resolves.not.toThrow();
    });
  });

  describe('validatePageAccess', () => {
    const publicEnabledSettings = {
      isBuildInPublicEnabled: true,
      isObjectivesPagePublic: true,
      isRoadmapPagePublic: true,
      isCyclesPagePublic: true,
      isActiveCyclesPagePublic: true,
      isActiveWorkPagePublic: true,
      isRequestsPagePublic: true,
      isIssuesPagePublic: true,
    };

    const standardPages: Array<
      'objectives' | 'roadmap' | 'cycles' | 'issues' | 'requests'
    > = ['objectives', 'roadmap', 'cycles', 'issues', 'requests'];

    const pageFlagByPage = {
      objectives: 'isObjectivesPagePublic',
      roadmap: 'isRoadmapPagePublic',
      cycles: 'isCyclesPagePublic',
      issues: 'isIssuesPagePublic',
      requests: 'isRequestsPagePublic',
    } as const;

    const setCyclesEnabled = async (cyclesEnabled: boolean) => {
      project.cyclesEnabled = cyclesEnabled;
      await projectsRepository.save(project);
    };

    it('should deny all pages when build in public is disabled', async () => {
      await setCyclesEnabled(true);
      await service.createOrUpdateSettings(org.id, project.id, {
        ...publicEnabledSettings,
        isBuildInPublicEnabled: false,
      });

      await expect(
        service.validatePageAccess(org.id, project.id, 'objectives'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it.each(standardPages)(
      'should allow and deny %s page based on its flag',
      async (page) => {
        await setCyclesEnabled(true);
        const pageFlag = pageFlagByPage[page];

        await service.createOrUpdateSettings(org.id, project.id, {
          ...publicEnabledSettings,
          [pageFlag]: true,
        });

        await expect(
          service.validatePageAccess(org.id, project.id, page),
        ).resolves.toBeUndefined();

        await service.createOrUpdateSettings(org.id, project.id, {
          ...publicEnabledSettings,
          [pageFlag]: false,
        });

        await expect(
          service.validatePageAccess(org.id, project.id, page),
        ).rejects.toBeInstanceOf(NotFoundException);
      },
    );

    it('should allow activeCycles only when cycles are enabled', async () => {
      await setCyclesEnabled(true);
      await service.createOrUpdateSettings(org.id, project.id, {
        ...publicEnabledSettings,
        isActiveCyclesPagePublic: true,
      });

      await expect(
        service.validatePageAccess(org.id, project.id, 'activeCycles'),
      ).resolves.toBeUndefined();
    });

    it('should deny activeCycles when cycles are disabled', async () => {
      await setCyclesEnabled(false);
      await service.createOrUpdateSettings(org.id, project.id, {
        ...publicEnabledSettings,
        isActiveCyclesPagePublic: true,
      });

      await expect(
        service.validatePageAccess(org.id, project.id, 'activeCycles'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('should allow activeWork only when cycles are disabled', async () => {
      await setCyclesEnabled(false);
      await service.createOrUpdateSettings(org.id, project.id, {
        ...publicEnabledSettings,
        isActiveWorkPagePublic: true,
      });

      await expect(
        service.validatePageAccess(org.id, project.id, 'activeWork'),
      ).resolves.toBeUndefined();
    });

    it('should deny activeWork when cycles are enabled', async () => {
      await setCyclesEnabled(true);
      await service.createOrUpdateSettings(org.id, project.id, {
        ...publicEnabledSettings,
        isActiveWorkPagePublic: true,
      });

      await expect(
        service.validatePageAccess(org.id, project.id, 'activeWork'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
