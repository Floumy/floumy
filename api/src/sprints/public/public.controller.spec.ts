import { PublicController } from './public.controller';
import { Org } from '../../orgs/org.entity';
import { User } from '../../users/user.entity';
import { WorkItemsService } from '../../backlog/work-items/work-items.service';
import { setupTestingModule } from '../../../test/test.utils';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Objective } from '../../okrs/objective.entity';
import { KeyResult } from '../../okrs/key-result.entity';
import { Feature } from '../../roadmap/features/feature.entity';
import { WorkItem } from '../../backlog/work-items/work-item.entity';
import { Milestone } from '../../roadmap/milestones/milestone.entity';
import { Sprint } from '../sprint.entity';
import { File } from '../../files/file.entity';
import { WorkItemFile } from '../../backlog/work-items/work-item-file.entity';
import { FeatureFile } from '../../roadmap/features/feature-file.entity';
import { UsersModule } from '../../users/users.module';
import { OkrsService } from '../../okrs/okrs.service';
import { OrgsService } from '../../orgs/orgs.service';
import { TokensService } from '../../auth/tokens.service';
import { FeaturesService } from '../../roadmap/features/features.service';
import { MilestonesService } from '../../roadmap/milestones/milestones.service';
import { SprintsService } from '../sprints.service';
import { FilesService } from '../../files/files.service';
import { FilesStorageRepository } from '../../files/files-storage.repository';
import { UsersService } from '../../users/users.service';
import { BipSettings } from '../../bip/bip-settings.entity';
import { Repository } from 'typeorm';
import { Timeline } from '../../common/timeline.enum';
import { PublicService } from './public.service';
import { Project } from '../../projects/project.entity';

describe('PublicController', () => {
  let controller: PublicController;
  let sprintsService: SprintsService;
  let bipSettingsRepository: Repository<BipSettings>;
  let orgsService: OrgsService;
  let cleanup: () => Promise<void>;
  let org: Org;
  let user: User;
  let project: Project;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [
        TypeOrmModule.forFeature([
          Org,
          Objective,
          KeyResult,
          Feature,
          WorkItem,
          Milestone,
          Sprint,
          File,
          WorkItemFile,
          FeatureFile,
          BipSettings,
          Project,
        ]),
        UsersModule,
      ],
      [
        OkrsService,
        OrgsService,
        TokensService,
        FeaturesService,
        MilestonesService,
        WorkItemsService,
        SprintsService,
        FilesService,
        FilesStorageRepository,
        PublicService,
      ],
      [PublicController],
    );
    cleanup = dbCleanup;
    controller = module.get<PublicController>(PublicController);
    orgsService = module.get<OrgsService>(OrgsService);
    bipSettingsRepository = module.get<Repository<BipSettings>>(
      getRepositoryToken(BipSettings),
    );
    sprintsService = module.get<SprintsService>(SprintsService);
    const usersService = module.get<UsersService>(UsersService);
    user = await usersService.createUserWithOrg(
      'Test User',
      'test@example.com',
      'testtesttest',
    );
    org = await orgsService.createForUser(user);
    project = (await org.projects)[0];
    const bipSettings = new BipSettings();
    bipSettings.isBuildInPublicEnabled = true;
    bipSettings.org = Promise.resolve(org);
    bipSettings.project = Promise.resolve(project);
    await bipSettingsRepository.save(bipSettings);
  });

  afterEach(async () => {
    await cleanup();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('When getting sprints for timeline', () => {
    it('should return a list of sprints', async () => {
      await sprintsService.create(org.id, project.id, {
        goal: 'Test Goal',
        startDate: new Date().toString(),
        duration: 1,
      });
      const result = await controller.listSprintsForTimeline(
        org.id,
        project.id,
        Timeline.THIS_QUARTER,
      );
      expect(result.length).toBe(1);
    });
  });

  describe('When getting an sprint by id', () => {
    it('should return an sprint', async () => {
      const sprint = await sprintsService.create(org.id, project.id, {
        goal: 'Test Goal',
        startDate: new Date().toString(),
        duration: 1,
      });
      const result = await controller.getSprintById(
        org.id,
        project.id,
        sprint.id,
      );
      expect(result).toBeDefined();
    });
  });

  describe('When getting the active sprint', () => {
    it('should return an sprint', async () => {
      const orgWithActiveSprint = await orgsService.createForUser(user);
      const projectWithActiveSprint = (
        await orgWithActiveSprint.projects
      )[0];
      const bipSettings = new BipSettings();
      bipSettings.isBuildInPublicEnabled = true;
      bipSettings.isActiveSprintsPagePublic = true;
      bipSettings.org = Promise.resolve(orgWithActiveSprint);
      bipSettings.project = Promise.resolve(projectWithActiveSprint);
      await bipSettingsRepository.save(bipSettings);

      const sprint = await sprintsService.create(
        orgWithActiveSprint.id,
        projectWithActiveSprint.id,
        {
          goal: 'Test Goal',
          startDate: new Date().toString(),
          duration: 1,
        },
      );
      await sprintsService.startSprint(
        orgWithActiveSprint.id,
        projectWithActiveSprint.id,
        sprint.id,
      );
      const result = await controller.getActiveSprint(
        orgWithActiveSprint.id,
        projectWithActiveSprint.id,
      );
      expect(result).toBeDefined();
    });
  });
});
