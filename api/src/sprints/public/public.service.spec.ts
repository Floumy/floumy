import { PublicService } from './public.service';
import { UsersService } from '../../users/users.service';
import { OrgsService } from '../../orgs/orgs.service';
import { SprintsService } from '../sprints.service';
import { WorkItemsService } from '../../backlog/work-items/work-items.service';
import { Org } from '../../orgs/org.entity';
import { User } from '../../users/user.entity';
import { setupTestingModule } from '../../../test/test.utils';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Objective } from '../../okrs/objective.entity';
import { KeyResult } from '../../okrs/key-result.entity';
import { Initiative } from '../../roadmap/initiatives/initiative.entity';
import { Milestone } from '../../roadmap/milestones/milestone.entity';
import { WorkItem } from '../../backlog/work-items/work-item.entity';
import { Sprint } from '../sprint.entity';
import { File } from '../../files/file.entity';
import { WorkItemFile } from '../../backlog/work-items/work-item-file.entity';
import { InitiativeFile } from '../../roadmap/initiatives/initiative-file.entity';
import { BacklogModule } from '../../backlog/backlog.module';
import { OkrsService } from '../../okrs/okrs.service';
import { InitiativesService } from '../../roadmap/initiatives/initiatives.service';
import { MilestonesService } from '../../roadmap/milestones/milestones.service';
import { FilesService } from '../../files/files.service';
import { FilesStorageRepository } from '../../files/files-storage.repository';
import { BipSettings } from '../../bip/bip-settings.entity';
import { Repository } from 'typeorm';
import { CreateOrUpdateSprintDto } from '../dtos';
import { Timeline } from '../../common/timeline.enum';
import { OrgsModule } from '../../orgs/orgs.module';
import { Project } from '../../projects/project.entity';

describe('PublicService', () => {
  let usersService: UsersService;
  let orgsService: OrgsService;
  let service: PublicService;
  let sprintsService: SprintsService;
  let org: Org;
  let bipSettingsRepository: Repository<BipSettings>;
  let user: User;
  let project: Project;
  let projectsRepository: Repository<Project>;

  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [
        TypeOrmModule.forFeature([
          Objective,
          Org,
          KeyResult,
          Initiative,
          User,
          Milestone,
          WorkItem,
          Sprint,
          File,
          WorkItemFile,
          InitiativeFile,
          BipSettings,
          Project,
        ]),
        OrgsModule,
        BacklogModule,
      ],
      [
        OkrsService,
        InitiativesService,
        UsersService,
        WorkItemsService,
        MilestonesService,
        SprintsService,
        PublicService,
        FilesService,
        FilesStorageRepository,
      ],
    );
    cleanup = dbCleanup;
    service = module.get<PublicService>(PublicService);
    orgsService = module.get<OrgsService>(OrgsService);
    usersService = module.get<UsersService>(UsersService);
    sprintsService = module.get<SprintsService>(SprintsService);
    bipSettingsRepository = module.get<Repository<BipSettings>>(
      getRepositoryToken(BipSettings),
    );
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
    expect(service).toBeDefined();
  });

  describe('when listing sprints', () => {
    it('should return an empty array if there are no sprints', async () => {
      const result = await service.listSprintsForTimeline(
        org.id,
        project.id,
        Timeline.THIS_QUARTER,
      );
      expect(result).toEqual([]);
    });
    it('should return an array of sprints', async () => {
      const sprint = {
        goal: 'Test Goal',
        startDate: new Date().toString(),
        duration: 2,
      } as CreateOrUpdateSprintDto;
      await sprintsService.create(org.id, project.id, sprint);
      const result = await service.listSprintsForTimeline(
        org.id,
        project.id,
        Timeline.THIS_QUARTER,
      );
      expect(result.length).toEqual(1);
      expect(result[0].goal).toEqual('Test Goal');
    });
  });

  describe('when getting an sprint by id', () => {
    it('should return an sprint', async () => {
      const sprint = await sprintsService.create(org.id, project.id, {
        goal: 'Test Goal',
        startDate: new Date().toString(),
        duration: 1,
      });
      const result = await service.getSprintById(
        org.id,
        project.id,
        sprint.id,
      );
      expect(result).toBeDefined();
    });
    it('should throw an error if the org does not have build in public enabled', async () => {
      const bipSettings = new BipSettings();
      bipSettings.isBuildInPublicEnabled = false;
      bipSettings.org = Promise.resolve(org);
      bipSettings.project = Promise.resolve(project);
      await bipSettingsRepository.save(bipSettings);
      const nonExistentUUID = '00000000-0000-0000-0000-000000000000';
      await expect(
        service.getSprintById(org.id, project.id, nonExistentUUID),
      ).rejects.toThrow();
    });
    it('should throw an error if the sprint does not exist', async () => {
      const nonExistentUUID = '00000000-0000-0000-0000-000000000000';
      await expect(
        service.getSprintById(org.id, project.id, nonExistentUUID),
      ).rejects.toThrow();
    });
    it('should throw an error if the org does not exist', async () => {
      const nonExistentUUID = '00000000-0000-0000-0000-000000000000';
      await expect(
        service.getSprintById(
          nonExistentUUID,
          nonExistentUUID,
          nonExistentUUID,
        ),
      ).rejects.toThrow();
    });
  });
  describe('when getting the active sprint', () => {
    it('should return the active sprint', async () => {
      const orgWithActiveSprints = await orgsService.getOrCreateOrg('Test Project');
      const projectWithActiveSprints = new Project();
      projectWithActiveSprints.name = 'Test Project';
      projectWithActiveSprints.org = Promise.resolve(
        orgWithActiveSprints,
      );
      await projectsRepository.save(projectWithActiveSprints);
      const bipSettings = new BipSettings();
      bipSettings.isBuildInPublicEnabled = true;
      bipSettings.isActiveSprintsPagePublic = true;
      bipSettings.org = Promise.resolve(orgWithActiveSprints);
      bipSettings.project = Promise.resolve(projectWithActiveSprints);
      await bipSettingsRepository.save(bipSettings);

      const sprint = await sprintsService.create(
        orgWithActiveSprints.id,
        projectWithActiveSprints.id,
        {
          goal: 'Test Goal',
          startDate: new Date().toString(),
          duration: 1,
        },
      );
      await sprintsService.startSprint(
        orgWithActiveSprints.id,
        projectWithActiveSprints.id,
        sprint.id,
      );
      const result = await service.getActiveSprint(
        orgWithActiveSprints.id,
        projectWithActiveSprints.id,
      );
      expect(result).toBeDefined();
      expect(result.goal).toEqual('Test Goal');
    });
    it('should return null if there is no active sprint', async () => {
      const orgWithActiveSprints = await orgsService.getOrCreateOrg('Test Project');
      const projectWithActiveSprints = new Project();
      projectWithActiveSprints.name = 'Test Project';
      projectWithActiveSprints.org = Promise.resolve(
        orgWithActiveSprints,
      );
      await projectsRepository.save(projectWithActiveSprints);
      const bipSettings = new BipSettings();
      bipSettings.isBuildInPublicEnabled = true;
      bipSettings.isActiveSprintsPagePublic = true;
      bipSettings.org = Promise.resolve(orgWithActiveSprints);
      bipSettings.project = Promise.resolve(projectWithActiveSprints);
      await bipSettingsRepository.save(bipSettings);

      await sprintsService.create(
        orgWithActiveSprints.id,
        projectWithActiveSprints.id,
        {
          goal: 'Test Goal',
          startDate: new Date().toString(),
          duration: 1,
        },
      );

      const result = await service.getActiveSprint(
        orgWithActiveSprints.id,
        projectWithActiveSprints.id,
      );

      expect(result).toBeNull();
    });
    it('should throw an error if the org does not have build in public enabled', async () => {
      const newOrg = await orgsService.createForUser(user);
      const newProject = (await newOrg.projects)[0];
      const bipSettings = new BipSettings();
      bipSettings.isBuildInPublicEnabled = false;
      bipSettings.isSprintsPagePublic = true;
      bipSettings.org = Promise.resolve(newOrg);
      bipSettings.project = Promise.resolve(newProject);
      await bipSettingsRepository.save(bipSettings);
      await expect(
        service.getActiveSprint(newOrg.id, newProject.id),
      ).rejects.toThrow();
    });
    it('should throw an error if the org does not exist', async () => {
      const nonExistentUUID = '00000000-0000-0000-0000-000000000000';
      await expect(
        service.getActiveSprint(nonExistentUUID, nonExistentUUID),
      ).rejects.toThrow();
    });
    it('should throw an error if the org does not have active sprints page public enabled', async () => {
      const newOrg = await orgsService.createForUser(user);
      const newProject = (await newOrg.projects)[0];
      const bipSettings = new BipSettings();
      bipSettings.isBuildInPublicEnabled = true;
      bipSettings.isActiveSprintsPagePublic = false;
      bipSettings.org = Promise.resolve(newOrg);
      bipSettings.project = Promise.resolve(newProject);
      await bipSettingsRepository.save(bipSettings);
      await expect(
        service.getActiveSprint(newOrg.id, newProject.id),
      ).rejects.toThrow();
    });
  });
});
