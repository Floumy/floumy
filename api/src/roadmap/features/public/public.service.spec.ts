import { PublicService } from './public.service';
import { UsersService } from '../../../users/users.service';
import { FeaturesService } from '../features.service';
import { WorkItemsService } from '../../../backlog/work-items/work-items.service';
import { MilestonesService } from '../../milestones/milestones.service';
import { OkrsService } from '../../../okrs/okrs.service';
import { OrgsService } from '../../../orgs/orgs.service';
import { FilesService } from '../../../files/files.service';
import { User } from '../../../users/user.entity';
import { Org } from '../../../orgs/org.entity';
import { setupTestingModule } from '../../../../test/test.utils';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Objective } from '../../../okrs/objective.entity';
import { KeyResult } from '../../../okrs/key-result.entity';
import { Feature } from '../feature.entity';
import { Milestone } from '../../milestones/milestone.entity';
import { WorkItem } from '../../../backlog/work-items/work-item.entity';
import { Iteration } from '../../../iterations/Iteration.entity';
import { File } from '../../../files/file.entity';
import { WorkItemFile } from '../../../backlog/work-items/work-item-file.entity';
import { FeatureFile } from '../feature-file.entity';
import { FilesStorageRepository } from '../../../files/files-storage.repository';
import { BipSettings } from '../../../bip/bip-settings.entity';
import { Repository } from 'typeorm';

describe('PublicService', () => {
  let usersService: UsersService;
  let service: PublicService;
  let orgsService: OrgsService;
  let user: User;
  let org: Org;
  let featuresRepository: Repository<Feature>;
  let bipRepository: Repository<BipSettings>;
  let orgsRepository: Repository<Org>;

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
      ],
      [
        OkrsService,
        OrgsService,
        FeaturesService,
        UsersService,
        MilestonesService,
        WorkItemsService,
        FilesService,
        FilesStorageRepository,
        PublicService,
      ],
    );
    cleanup = dbCleanup;
    service = module.get<PublicService>(PublicService);
    usersService = module.get<UsersService>(UsersService);
    orgsService = module.get<OrgsService>(OrgsService);
    featuresRepository = module.get<Repository<Feature>>(
      getRepositoryToken(Feature),
    );
    bipRepository = module.get<Repository<BipSettings>>(
      getRepositoryToken(BipSettings),
    );
    orgsRepository = module.get<Repository<Org>>(getRepositoryToken(Org));
    user = await usersService.createUserWithOrg(
      'Test User',
      'test@example.com',
      'testtesttest',
    );
    org = await orgsService.createForUser(user);
    const bipSettings = new BipSettings();
    bipSettings.isBuildInPublicEnabled = true;
    bipSettings.org = Promise.resolve(org);
    await bipRepository.save(bipSettings);
  });

  afterEach(async () => {
    await cleanup();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('when getting a feature', () => {
    it('should return a feature', async () => {
      const feature = new Feature();
      feature.title = 'Test Feature';
      feature.org = Promise.resolve(org);
      await featuresRepository.save(feature);
      const actual = await service.getFeature(org.id, feature.id);
      expect(actual).toBeDefined();
    });
    it('should throw an error if the org is not public', async () => {
      const newOrg = new Org();
      await orgsRepository.save(newOrg);
      const bipSettings = new BipSettings();
      bipSettings.isBuildInPublicEnabled = false;
      bipSettings.org = Promise.resolve(newOrg);
      await bipRepository.save(bipSettings);
      const feature = new Feature();
      feature.title = 'Test Feature';
      feature.org = Promise.resolve(newOrg);
      await featuresRepository.save(feature);
      await expect(service.getFeature(newOrg.id, feature.id)).rejects.toThrow(
        'Roadmap page is not public',
      );
    });
    it('should throw an error if the feature does not belong to the org', async () => {
      const feature = new Feature();
      feature.title = 'Test Feature';
      feature.org = Promise.resolve(new Org());
      await featuresRepository.save(feature);
      await expect(service.getFeature(org.id, feature.id)).rejects.toThrow();
    });
  });
});
