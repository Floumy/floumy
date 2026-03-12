import { PublicController } from './public.controller';
import { Org } from '../../orgs/org.entity';
import { User } from '../../users/user.entity';
import { WorkItemsService } from '../../backlog/work-items/work-items.service';
import { setupTestingModule } from '../../../test/test.utils';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Objective } from '../../okrs/objective.entity';
import { KeyResult } from '../../okrs/key-result.entity';
import { Initiative } from '../../roadmap/initiatives/initiative.entity';
import { WorkItem } from '../../backlog/work-items/work-item.entity';
import { Milestone } from '../../roadmap/milestones/milestone.entity';
import { Cycle } from '../cycle.entity';
import { File } from '../../files/file.entity';
import { WorkItemFile } from '../../backlog/work-items/work-item-file.entity';
import { InitiativeFile } from '../../roadmap/initiatives/initiative-file.entity';
import { UsersModule } from '../../users/users.module';
import { OkrsService } from '../../okrs/okrs.service';
import { OrgsService } from '../../orgs/orgs.service';
import { TokensService } from '../../auth/tokens.service';
import { InitiativesService } from '../../roadmap/initiatives/initiatives.service';
import { MilestonesService } from '../../roadmap/milestones/milestones.service';
import { CyclesService } from '../cycles.service';
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
  let cyclesService: CyclesService;
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
          Initiative,
          WorkItem,
          Milestone,
          Cycle,
          File,
          WorkItemFile,
          InitiativeFile,
          BipSettings,
          Project,
        ]),
        UsersModule,
      ],
      [
        OkrsService,
        OrgsService,
        TokensService,
        InitiativesService,
        MilestonesService,
        WorkItemsService,
        CyclesService,
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
    cyclesService = module.get<CyclesService>(CyclesService);
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
    bipSettings.isCyclesPagePublic = true;
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

  describe('When getting cycles for timeline', () => {
    it('should return a list of cycles', async () => {
      await cyclesService.create(org.id, project.id, {
        goal: 'Test Goal',
        startDate: new Date().toString(),
        duration: 1,
      });
      const result = await controller.listCyclesForTimeline(
        org.id,
        project.id,
        Timeline.THIS_QUARTER,
      );
      expect(result.length).toBe(1);
    });
  });

  describe('When getting a cycle by id', () => {
    it('should return a cycle', async () => {
      const cycle = await cyclesService.create(org.id, project.id, {
        goal: 'Test Goal',
        startDate: new Date().toString(),
        duration: 1,
      });
      const result = await controller.getCycleById(
        org.id,
        project.id,
        cycle.id,
      );
      expect(result).toBeDefined();
    });
  });

  describe('When getting the active cycle', () => {
    it('should return a cycle', async () => {
      const orgWithActiveCycle = await orgsService.createForUser(user);
      const projectWithActiveCycle = (await orgWithActiveCycle.projects)[0];
      const bipSettings = new BipSettings();
      bipSettings.isBuildInPublicEnabled = true;
      bipSettings.isActiveCyclesPagePublic = true;
      bipSettings.org = Promise.resolve(orgWithActiveCycle);
      bipSettings.project = Promise.resolve(projectWithActiveCycle);
      await bipSettingsRepository.save(bipSettings);

      const cycle = await cyclesService.create(
        orgWithActiveCycle.id,
        projectWithActiveCycle.id,
        {
          goal: 'Test Goal',
          startDate: new Date().toString(),
          duration: 1,
        },
      );
      await cyclesService.startCycle(
        orgWithActiveCycle.id,
        projectWithActiveCycle.id,
        cycle.id,
      );
      const result = await controller.getActiveCycle(
        orgWithActiveCycle.id,
        projectWithActiveCycle.id,
      );
      expect(result).toBeDefined();
    });
  });
});
