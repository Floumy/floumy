import { PublicService } from './public.service';
import { UsersService } from '../../users/users.service';
import { OrgsService } from '../../orgs/orgs.service';
import { CyclesService } from '../cycles.service';
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
import { Cycle } from '../cycle.entity';
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
import { CreateOrUpdateCycleDto } from '../dtos';
import { Timeline } from '../../common/timeline.enum';
import { OrgsModule } from '../../orgs/orgs.module';
import { Project } from '../../projects/project.entity';

describe('PublicService', () => {
  let usersService: UsersService;
  let orgsService: OrgsService;
  let service: PublicService;
  let cyclesService: CyclesService;
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
          Cycle,
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
        CyclesService,
        PublicService,
        FilesService,
        FilesStorageRepository,
      ],
    );
    cleanup = dbCleanup;
    service = module.get<PublicService>(PublicService);
    orgsService = module.get<OrgsService>(OrgsService);
    usersService = module.get<UsersService>(UsersService);
    cyclesService = module.get<CyclesService>(CyclesService);
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

  describe('when listing cycles', () => {
    it('should return an empty array if there are no cycles', async () => {
      const result = await service.listCyclesForTimeline(
        org.id,
        project.id,
        Timeline.THIS_QUARTER,
      );
      expect(result).toEqual([]);
    });
    it('should return an array of cycles', async () => {
      const cycle = {
        goal: 'Test Goal',
        startDate: new Date().toString(),
        duration: 2,
      } as CreateOrUpdateCycleDto;
      await cyclesService.create(org.id, project.id, cycle);
      const result = await service.listCyclesForTimeline(
        org.id,
        project.id,
        Timeline.THIS_QUARTER,
      );
      expect(result.length).toEqual(1);
      expect(result[0].goal).toEqual('Test Goal');
    });
  });

  describe('when getting a cycle by id', () => {
    it('should return a cycle', async () => {
      const cycle = await cyclesService.create(org.id, project.id, {
        goal: 'Test Goal',
        startDate: new Date().toString(),
        duration: 1,
      });
      const result = await service.getCycleById(org.id, project.id, cycle.id);
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
        service.getCycleById(org.id, project.id, nonExistentUUID),
      ).rejects.toThrow();
    });
    it('should throw an error if the cycle does not exist', async () => {
      const nonExistentUUID = '00000000-0000-0000-0000-000000000000';
      await expect(
        service.getCycleById(org.id, project.id, nonExistentUUID),
      ).rejects.toThrow();
    });
    it('should throw an error if the org does not exist', async () => {
      const nonExistentUUID = '00000000-0000-0000-0000-000000000000';
      await expect(
        service.getCycleById(
          nonExistentUUID,
          nonExistentUUID,
          nonExistentUUID,
        ),
      ).rejects.toThrow();
    });
  });
  describe('when getting the active cycle', () => {
    it('should return the active cycle', async () => {
      const orgWithActiveCycles =
        await orgsService.getOrCreateOrg('Test Project');
      const projectWithActiveCycles = new Project();
      projectWithActiveCycles.name = 'Test Project';
      projectWithActiveCycles.org = Promise.resolve(orgWithActiveCycles);
      await projectsRepository.save(projectWithActiveCycles);
      const bipSettings = new BipSettings();
      bipSettings.isBuildInPublicEnabled = true;
      bipSettings.isActiveCyclesPagePublic = true;
      bipSettings.org = Promise.resolve(orgWithActiveCycles);
      bipSettings.project = Promise.resolve(projectWithActiveCycles);
      await bipSettingsRepository.save(bipSettings);

      const cycle = await cyclesService.create(
        orgWithActiveCycles.id,
        projectWithActiveCycles.id,
        {
          goal: 'Test Goal',
          startDate: new Date().toString(),
          duration: 1,
        },
      );
      await cyclesService.startCycle(
        orgWithActiveCycles.id,
        projectWithActiveCycles.id,
        cycle.id,
      );
      const result = await service.getActiveCycle(
        orgWithActiveCycles.id,
        projectWithActiveCycles.id,
      );
      expect(result).toBeDefined();
      expect(result.goal).toEqual('Test Goal');
    });
    it('should return null if there is no active cycle', async () => {
      const orgWithActiveCycles =
        await orgsService.getOrCreateOrg('Test Project');
      const projectWithActiveCycles = new Project();
      projectWithActiveCycles.name = 'Test Project';
      projectWithActiveCycles.org = Promise.resolve(orgWithActiveCycles);
      await projectsRepository.save(projectWithActiveCycles);
      const bipSettings = new BipSettings();
      bipSettings.isBuildInPublicEnabled = true;
      bipSettings.isActiveCyclesPagePublic = true;
      bipSettings.org = Promise.resolve(orgWithActiveCycles);
      bipSettings.project = Promise.resolve(projectWithActiveCycles);
      await bipSettingsRepository.save(bipSettings);

      await cyclesService.create(
        orgWithActiveCycles.id,
        projectWithActiveCycles.id,
        {
          goal: 'Test Goal',
          startDate: new Date().toString(),
          duration: 1,
        },
      );

      const result = await service.getActiveCycle(
        orgWithActiveCycles.id,
        projectWithActiveCycles.id,
      );

      expect(result).toBeNull();
    });
    it('should throw an error if the org does not have build in public enabled', async () => {
      const newOrg = await orgsService.createForUser(user);
      const newProject = (await newOrg.projects)[0];
      const bipSettings = new BipSettings();
      bipSettings.isBuildInPublicEnabled = false;
      bipSettings.isCyclesPagePublic = true;
      bipSettings.org = Promise.resolve(newOrg);
      bipSettings.project = Promise.resolve(newProject);
      await bipSettingsRepository.save(bipSettings);
      await expect(
        service.getActiveCycle(newOrg.id, newProject.id),
      ).rejects.toThrow();
    });
    it('should throw an error if the org does not exist', async () => {
      const nonExistentUUID = '00000000-0000-0000-0000-000000000000';
      await expect(
        service.getActiveCycle(nonExistentUUID, nonExistentUUID),
      ).rejects.toThrow();
    });
    it('should throw an error if the org does not have active cycles page public enabled', async () => {
      const newOrg = await orgsService.createForUser(user);
      const newProject = (await newOrg.projects)[0];
      const bipSettings = new BipSettings();
      bipSettings.isBuildInPublicEnabled = true;
      bipSettings.isActiveCyclesPagePublic = false;
      bipSettings.org = Promise.resolve(newOrg);
      bipSettings.project = Promise.resolve(newProject);
      await bipSettingsRepository.save(bipSettings);
      await expect(
        service.getActiveCycle(newOrg.id, newProject.id),
      ).rejects.toThrow();
    });
  });
});
