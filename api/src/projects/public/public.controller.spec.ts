import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { PublicController } from './public.controller';
import { Org } from '../../orgs/org.entity';
import { Project } from '../project.entity';
import { PublicService } from './public.service';
import { UsersModule } from '../../users/users.module';
import { User } from '../../users/user.entity';
import { setupTestingModule } from '../../../test/test.utils';
import { UsersService } from '../../users/users.service';
import { BipSettings } from '../../bip/bip-settings.entity';
import { Repository } from 'typeorm';

describe('PublicController', () => {
  let controller: PublicController;
  let cleanup: () => Promise<void>;
  let org: Org;
  let user: User;
  let project: Project;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [TypeOrmModule.forFeature([Org, User, Project]), UsersModule],
      [PublicService],
      [PublicController],
    );
    cleanup = dbCleanup;
    controller = module.get<PublicController>(PublicController);
    const usersService = module.get<UsersService>(UsersService);
    user = await usersService.createUserWithOrg(
      'Test User',
      'test@example.com',
      'testtesttest',
    );
    org = await user.org;
    project = (await org.projects)[0];
    const bipRepository = module.get<Repository<BipSettings>>(
      getRepositoryToken(BipSettings),
    );
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
    expect(controller).toBeDefined();
  });

  describe('when getting a project', () => {
    it('should return the project', async () => {
      const projectResult = await controller.getProject(org.id, project.id);
      expect(projectResult).toBeDefined();
      expect(projectResult.id).toEqual(project.id);
      expect(projectResult.name).toEqual(project.name);
      expect(projectResult.bipSettings).toBeDefined();
      expect(projectResult.bipSettings.isBuildInPublicEnabled).toBeDefined();
      expect(projectResult.bipSettings.isObjectivesPagePublic).toBeDefined();
      expect(projectResult.bipSettings.isRoadmapPagePublic).toBeDefined();
      expect(projectResult.bipSettings.isSprintsPagePublic).toBeDefined();
      expect(
        projectResult.bipSettings.isActiveSprintsPagePublic,
      ).toBeDefined();
      expect(projectResult.bipSettings.isFeedPagePublic).toBeDefined();
      expect(projectResult.bipSettings.isIssuesPagePublic).toBeDefined();
      expect(
        projectResult.bipSettings.isFeatureRequestsPagePublic,
      ).toBeDefined();
    });
  });
});
