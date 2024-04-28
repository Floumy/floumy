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
import { Iteration } from '../Iteration.entity';
import { File } from '../../files/file.entity';
import { WorkItemFile } from '../../backlog/work-items/work-item-file.entity';
import { FeatureFile } from '../../roadmap/features/feature-file.entity';
import { UsersModule } from '../../users/users.module';
import { OkrsService } from '../../okrs/okrs.service';
import { OrgsService } from '../../orgs/orgs.service';
import { TokensService } from '../../auth/tokens.service';
import { FeaturesService } from '../../roadmap/features/features.service';
import { MilestonesService } from '../../roadmap/milestones/milestones.service';
import { IterationsService } from '../iterations.service';
import { FilesService } from '../../files/files.service';
import { FilesStorageRepository } from '../../files/files-storage.repository';
import { UsersService } from '../../users/users.service';
import { BipSettings } from '../../bip/bip-settings.entity';
import { Repository } from 'typeorm';
import { Timeline } from '../../common/timeline.enum';
import { PublicService } from './public.service';

describe('PublicController', () => {
  let controller: PublicController;
  let iterationsService: IterationsService;
  let bipSettingsRepository: Repository<BipSettings>;
  let orgsService: OrgsService;
  let cleanup: () => Promise<void>;
  let org: Org;
  let user: User;

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
          Iteration,
          File,
          WorkItemFile,
          FeatureFile,
          BipSettings,
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
        IterationsService,
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
    iterationsService = module.get<IterationsService>(IterationsService);
    const usersService = module.get<UsersService>(UsersService);
    user = await usersService.createUserWithOrg(
      'Test User',
      'test@example.com',
      'testtesttest',
    );
    org = await orgsService.createForUser(user);
    const bipSettings = new BipSettings();
    bipSettings.isBuildInPublicEnabled = true;
    bipSettings.org = Promise.resolve(org);
    await bipSettingsRepository.save(bipSettings);
  });

  afterEach(async () => {
    await cleanup();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('When getting iterations for timeline', () => {
    it('should return a list of iterations', async () => {
      await iterationsService.create(org.id, {
        goal: 'Test Goal',
        startDate: new Date().toString(),
        duration: 1,
      });
      const result = await controller.listIterationsForTimeline(
        org.id,
        Timeline.THIS_QUARTER,
      );
      expect(result.length).toBe(1);
    });
  });

  describe('When getting an iteration by id', () => {
    it('should return an iteration', async () => {
      const iteration = await iterationsService.create(org.id, {
        goal: 'Test Goal',
        startDate: new Date().toString(),
        duration: 1,
      });
      const result = await controller.getIterationById(org.id, iteration.id);
      expect(result).toBeDefined();
    });
  });

  describe('When getting the active iteration', () => {
    it('should return an iteration', async () => {
      const orgWithActiveIteration = await orgsService.createForUser(user);
      const bipSettings = new BipSettings();
      bipSettings.isBuildInPublicEnabled = true;
      bipSettings.isActiveIterationsPagePublic = true;
      bipSettings.org = Promise.resolve(orgWithActiveIteration);
      await bipSettingsRepository.save(bipSettings);

      const iteration = await iterationsService.create(
        orgWithActiveIteration.id,
        {
          goal: 'Test Goal',
          startDate: new Date().toString(),
          duration: 1,
        },
      );
      await iterationsService.startIteration(
        orgWithActiveIteration.id,
        iteration.id,
      );
      const result = await controller.getActiveIteration(
        orgWithActiveIteration.id,
      );
      expect(result).toBeDefined();
    });
  });
});
