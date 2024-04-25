import { PublicService } from './public.service';
import { UsersService } from '../../users/users.service';
import { OrgsService } from '../../orgs/orgs.service';
import { IterationsService } from '../iterations.service';
import { WorkItemsService } from '../../backlog/work-items/work-items.service';
import { Org } from '../../orgs/org.entity';
import { User } from '../../users/user.entity';
import { setupTestingModule } from '../../../test/test.utils';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Objective } from '../../okrs/objective.entity';
import { KeyResult } from '../../okrs/key-result.entity';
import { Feature } from '../../roadmap/features/feature.entity';
import { Milestone } from '../../roadmap/milestones/milestone.entity';
import { WorkItem } from '../../backlog/work-items/work-item.entity';
import { Iteration } from '../Iteration.entity';
import { File } from '../../files/file.entity';
import { WorkItemFile } from '../../backlog/work-items/work-item-file.entity';
import { FeatureFile } from '../../roadmap/features/feature-file.entity';
import { BacklogModule } from '../../backlog/backlog.module';
import { OkrsService } from '../../okrs/okrs.service';
import { FeaturesService } from '../../roadmap/features/features.service';
import { MilestonesService } from '../../roadmap/milestones/milestones.service';
import { FilesService } from '../../files/files.service';
import { FilesStorageRepository } from '../../files/files-storage.repository';
import { BipSettings } from '../../bip/bip-settings.entity';
import { Repository } from 'typeorm';
import { CreateOrUpdateIterationDto } from '../dtos';
import { Timeline } from '../../common/timeline.enum';

describe('PublicService', () => {
  let usersService: UsersService;
  let orgsService: OrgsService;
  let service: PublicService;
  let iterationsService: IterationsService;
  let org: Org;
  let bipSettingsRepository: Repository<BipSettings>;
  let user: User;

  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [
        TypeOrmModule.forFeature([
          Objective,
          Org,
          KeyResult,
          Feature,
          User,
          Milestone,
          WorkItem,
          Iteration,
          File,
          WorkItemFile,
          FeatureFile,
          BipSettings,
        ]),
        BacklogModule,
      ],
      [
        OkrsService,
        OrgsService,
        FeaturesService,
        UsersService,
        WorkItemsService,
        MilestonesService,
        IterationsService,
        PublicService,
        FilesService,
        FilesStorageRepository,
      ],
    );
    cleanup = dbCleanup;
    service = module.get<PublicService>(PublicService);
    orgsService = module.get<OrgsService>(OrgsService);
    usersService = module.get<UsersService>(UsersService);
    iterationsService = module.get<IterationsService>(IterationsService);
    bipSettingsRepository = module.get<Repository<BipSettings>>(
      getRepositoryToken(BipSettings),
    );
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
    expect(service).toBeDefined();
  });

  describe('when listing iterations', () => {
    it('should return an empty array if there are no iterations', async () => {
      const result = await service.listIterationsForTimeline(
        org.id,
        Timeline.THIS_QUARTER,
      );
      expect(result).toEqual([]);
    });
    it('should return an array of iterations', async () => {
      const iteration = {
        goal: 'Test Goal',
        startDate: new Date().toString(),
        duration: 2,
      } as CreateOrUpdateIterationDto;
      await iterationsService.create(org.id, iteration);
      const result = await service.listIterationsForTimeline(
        org.id,
        Timeline.THIS_QUARTER,
      );
      expect(result.length).toEqual(1);
      expect(result[0].goal).toEqual('Test Goal');
    });
  });
});
