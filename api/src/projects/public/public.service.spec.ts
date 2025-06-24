import { PublicService } from './public.service';

import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../../users/users.service';
import { OrgsService } from '../../orgs/orgs.service';
import { User } from '../../users/user.entity';
import { Org } from '../../orgs/org.entity';
import { Project } from '../project.entity';
import { setupTestingModule } from '../../../test/test.utils';
import { BipSettings } from '../../bip/bip-settings.entity';

describe('PublicService', () => {
  let usersService: UsersService;
  let service: PublicService;
  let orgsService: OrgsService;
  let user: User;
  let org: Org;
  let project: Project;
  let bipRepository: Repository<BipSettings>;

  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [TypeOrmModule.forFeature([Org, User, Project])],
      [OrgsService, UsersService, PublicService],
    );
    cleanup = dbCleanup;
    service = module.get<PublicService>(PublicService);
    usersService = module.get<UsersService>(UsersService);
    orgsService = module.get<OrgsService>(OrgsService);
    user = await usersService.createUserWithOrg(
      'Test User',
      'test@example.com',
      'testtesttest',
    );
    bipRepository = module.get<Repository<BipSettings>>(
      getRepositoryToken(BipSettings),
    );
    org = await orgsService.createForUser(user);
    project = (await org.projects)[0];
    const bipSettings = new BipSettings();
    bipSettings.isBuildInPublicEnabled = true;
    bipSettings.org = Promise.resolve(org);
    bipSettings.project = Promise.resolve(project);
    await bipRepository.save(bipSettings);
  });

  afterEach(async () => {
    await cleanup();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('when getting a project', () => {
    it('should return the project', async () => {
      const projectResult = await service.getProject(org.id, project.id);
      expect(projectResult).toBeDefined();
      expect(projectResult.id).toEqual(project.id);
      expect(projectResult.name).toEqual(project.name);
      expect(projectResult.bipSettings).toBeDefined();
      expect(projectResult.bipSettings.isBuildInPublicEnabled).toBeDefined();
      expect(projectResult.bipSettings.isObjectivesPagePublic).toBeDefined();
      expect(projectResult.bipSettings.isRoadmapPagePublic).toBeDefined();
      expect(projectResult.bipSettings.isSprintsPagePublic).toBeDefined();
      expect(projectResult.bipSettings.isActiveSprintsPagePublic).toBeDefined();
      expect(projectResult.bipSettings.isFeedPagePublic).toBeDefined();
      expect(projectResult.bipSettings.isIssuesPagePublic).toBeDefined();
      expect(
        projectResult.bipSettings.isFeatureRequestsPagePublic,
      ).toBeDefined();
    });
    it('should throw an error if the project is not public', async () => {
      const bipSettings = await project.bipSettings;
      bipSettings.isBuildInPublicEnabled = false;
      await bipRepository.save(bipSettings);
      await expect(
        service.getProject(org.id, project.id),
      ).rejects.toThrowError();
    });
  });
});
