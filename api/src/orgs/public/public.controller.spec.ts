import { PublicController } from './public.controller';
import { Org } from '../org.entity';
import { setupTestingModule } from '../../../test/test.utils';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../users/user.entity';
import { Objective } from '../../okrs/objective.entity';
import { KeyResult } from '../../okrs/key-result.entity';
import { Feature } from '../../roadmap/features/feature.entity';
import { WorkItem } from '../../backlog/work-items/work-item.entity';
import { Milestone } from '../../roadmap/milestones/milestone.entity';
import { Iteration } from '../../iterations/Iteration.entity';
import { File } from '../../files/file.entity';
import { WorkItemFile } from '../../backlog/work-items/work-item-file.entity';
import { FeatureFile } from '../../roadmap/features/feature-file.entity';
import { UsersModule } from '../../users/users.module';
import { OkrsService } from '../../okrs/okrs.service';
import { OrgsService } from '../orgs.service';
import { TokensService } from '../../auth/tokens.service';
import { FeaturesService } from '../../roadmap/features/features.service';
import { MilestonesService } from '../../roadmap/milestones/milestones.service';
import { WorkItemsService } from '../../backlog/work-items/work-items.service';
import { IterationsService } from '../../iterations/iterations.service';
import { FilesService } from '../../files/files.service';
import { FilesStorageRepository } from '../../files/files-storage.repository';
import { UsersService } from '../../users/users.service';
import { PublicService } from './public.service';
import { BipSettings } from '../../bip/bip-settings.entity';
import { Repository } from 'typeorm';

describe('PublicController', () => {
  let controller: PublicController;
  let cleanup: () => Promise<void>;
  let org: Org;
  let bipRepository: Repository<BipSettings>;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [
        TypeOrmModule.forFeature([
          Org,
          User,
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
    const orgsService = module.get<OrgsService>(OrgsService);
    const usersService = module.get<UsersService>(UsersService);
    const user = await usersService.createUserWithOrg(
      'Test User',
      'test@example.com',
      'testtesttest',
    );
    org = await orgsService.createForUser(user);
    bipRepository = module.get<Repository<BipSettings>>(
      getRepositoryToken(BipSettings),
    );
  });

  afterEach(async () => {
    await cleanup();
  });

  describe('when getting the org', () => {
    it('should return the org', async () => {
      const bipSettings = new BipSettings();
      bipSettings.isBuildInPublicEnabled = true;
      bipSettings.org = Promise.resolve(org);
      await bipRepository.save(bipSettings);

      const result = await controller.getOrg(org.id);
      expect(result).toBeDefined();
      expect(result.id).toEqual(org.id);
    });
    it('should throw an error if the org does not exist', async () => {
      await expect(controller.getOrg('invalid-id')).rejects.toThrow();
    });
    it('should throw an error if the org is not public', async () => {
      await expect(controller.getOrg(org.id)).rejects.toThrow();
    });
  });
});
