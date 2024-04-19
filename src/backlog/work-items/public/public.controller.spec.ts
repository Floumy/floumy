import { PublicController } from './public.controller';
import { Org } from '../../../orgs/org.entity';
import { User } from '../../../users/user.entity';
import { FeaturesService } from '../../../roadmap/features/features.service';
import { IterationsService } from '../../../iterations/iterations.service';
import { Repository } from 'typeorm';
import { File } from '../../../files/file.entity';
import { setupTestingModule } from '../../../../test/test.utils';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Objective } from '../../../okrs/objective.entity';
import { KeyResult } from '../../../okrs/key-result.entity';
import { Feature } from '../../../roadmap/features/feature.entity';
import { WorkItem } from '../work-item.entity';
import { Milestone } from '../../../roadmap/milestones/milestone.entity';
import { Iteration } from '../../../iterations/Iteration.entity';
import { FeatureFile } from '../../../roadmap/features/feature-file.entity';
import { WorkItemFile } from '../work-item-file.entity';
import { UsersModule } from '../../../users/users.module';
import { OkrsService } from '../../../okrs/okrs.service';
import { OrgsService } from '../../../orgs/orgs.service';
import { TokensService } from '../../../auth/tokens.service';
import { MilestonesService } from '../../../roadmap/milestones/milestones.service';
import { WorkItemsService } from '../work-items.service';
import { FilesService } from '../../../files/files.service';
import { FilesStorageRepository } from '../../../files/files-storage.repository';
import { UsersService } from '../../../users/users.service';
import { BipSettings } from '../../../bip/bip-settings.entity';
import { Priority } from '../../../common/priority.enum';
import { FeatureStatus } from '../../../roadmap/features/featurestatus.enum';

describe('PublicController', () => {
  let controller: PublicController;
  let cleanup: () => Promise<void>;
  let org: Org;
  let user: User;
  let featuresService: FeaturesService;

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
          FeatureFile,
          WorkItemFile,
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
      ],
      [PublicController],
    );
    cleanup = dbCleanup;
    controller = module.get<PublicController>(PublicController);
    const orgsService = module.get<OrgsService>(OrgsService);
    const usersService = module.get<UsersService>(UsersService);
    featuresService = module.get<FeaturesService>(FeaturesService);
    user = await usersService.createUserWithOrg(
      'Test User',
      'test@example.com',
      'testtesttest',
    );
    org = await orgsService.createForUser(user);
    const bipSettings = new BipSettings();
    bipSettings.isBuildInPublicEnabled = true;
    bipSettings.org = Promise.resolve(org);
    const bipRepository = module.get<Repository<BipSettings>>(
      getRepositoryToken(BipSettings),
    );
    await bipRepository.save(bipSettings);
  });

  afterEach(async () => {
    await cleanup();
  });

  describe('when getting a work item', () => {
    it('should return the work item', async () => {
      const workItem = await featuresService.createFeature(user.id, {
        priority: Priority.HIGH,
        status: FeatureStatus.CLOSED,
        title: 'Test Feature',
        description: 'Test Description',
      });
      const result = await controller.getWorkItem(org.id, workItem.id);
      expect(result).toBeDefined();
      expect(result.title).toEqual('Test Feature');
      expect(result.description).toEqual('Test Description');
    });
  });
});
