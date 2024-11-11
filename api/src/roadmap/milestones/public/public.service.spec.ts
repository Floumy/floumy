import { PublicService } from './public.service';
import { UsersService } from '../../../users/users.service';
import { MilestonesService } from '../milestones.service';
import { OrgsService } from '../../../orgs/orgs.service';
import { FeaturesService } from '../../features/features.service';
import { User } from '../../../users/user.entity';
import { Org } from '../../../orgs/org.entity';
import { setupTestingModule } from '../../../../test/test.utils';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Objective } from '../../../okrs/objective.entity';
import { KeyResult } from '../../../okrs/key-result.entity';
import { Milestone } from '../milestone.entity';
import { Feature } from '../../features/feature.entity';
import { File } from '../../../files/file.entity';
import { FeatureFile } from '../../features/feature-file.entity';
import { BacklogModule } from '../../../backlog/backlog.module';
import { FilesModule } from '../../../files/files.module';
import { OkrsService } from '../../../okrs/okrs.service';
import { BipSettings } from '../../../bip/bip-settings.entity';
import { Repository } from 'typeorm';
import { Timeline } from '../../../common/timeline.enum';

describe('PublicService', () => {
  let usersService: UsersService;
  let service: PublicService;
  let orgsService: OrgsService;
  let featuresRepository: Repository<Feature>;
  let milestonesRepository: Repository<Milestone>;
  let user: User;
  let org: Org;
  let bipRepository: Repository<BipSettings>;

  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [
        TypeOrmModule.forFeature([
          Objective,
          Org,
          KeyResult,
          Milestone,
          Feature,
          User,
          Objective,
          KeyResult,
          File,
          FeatureFile,
          BipSettings,
        ]),
        BacklogModule,
        FilesModule,
      ],
      [
        OrgsService,
        PublicService,
        UsersService,
        FeaturesService,
        OkrsService,
        MilestonesService,
      ],
    );
    cleanup = dbCleanup;
    service = module.get<PublicService>(PublicService);
    usersService = module.get<UsersService>(UsersService);
    orgsService = module.get<OrgsService>(OrgsService);
    user = await usersService.createUserWithOrg(
      'Test User',
      'test@example.com',
      'testtesttest',
    );
    bipRepository = module.get<Repository<BipSettings>>(
      getRepositoryToken(BipSettings),
    );
    featuresRepository = module.get<Repository<Feature>>(
      getRepositoryToken(Feature),
    );
    milestonesRepository = module.get<Repository<Milestone>>(
      getRepositoryToken(Milestone),
    );
    org = await orgsService.createForUser(user);
    const bipSettings = new BipSettings();
    bipSettings.isBuildInPublicEnabled = true;
    bipSettings.isRoadmapPagePublic = true;
    bipSettings.org = Promise.resolve(org);
    await bipRepository.save(bipSettings);
  });

  afterEach(async () => {
    await cleanup();
  });

  async function createMilestone(title: string, features: Feature[] = []) {
    const milestone = new Milestone();
    milestone.org = Promise.resolve(org);
    milestone.title = title;
    milestone.description = 'Description';
    milestone.dueDate = new Date();
    milestone.features = Promise.resolve(features);
    return await milestonesRepository.save(milestone);
  }

  async function createFeature(title: string) {
    const feature = new Feature();
    feature.org = Promise.resolve(org);
    feature.title = title;
    return await featuresRepository.save(feature);
  }

  describe('when listing milestones', () => {
    it('should return a list of milestones', async () => {
      const feature1 = await createFeature('Feature 1');
      const feature2 = await createFeature('Feature 2');
      const milestone1 = await createMilestone('Milestone 1', [
        feature1,
        feature2,
      ]);

      const feature3 = await createFeature('Feature 3');
      const milestone2 = await createMilestone('Milestone 2', [feature3]);

      const milestones = await service.listMilestones(
        org.id,
        Timeline.THIS_QUARTER,
      );
      expect(milestones).toBeDefined();
      expect(milestones[0].title).toBe(milestone2.title);
      expect(milestones[0].features.length).toBe(1);
      expect(milestones[0].features[0].title).toBe('Feature 3');
      expect(milestones.length).toBe(2);
      expect(milestones[1].title).toBe(milestone1.title);
      expect(milestones[1].features.length).toBe(2);
      expect(milestones[1].features[0].title).toBe('Feature 1');
      expect(milestones[1].features[1].title).toBe('Feature 2');
    });
  });

  describe('when getting a milestone', () => {
    it('should return the milestone', async () => {
      const milestone = new Milestone();
      milestone.org = Promise.resolve(org);
      milestone.title = 'test';
      milestone.description = 'test description';
      milestone.dueDate = new Date();
      await milestonesRepository.save(milestone);

      const actual = await service.findMilestone(org.id, milestone.id);

      expect(actual.id).toEqual(milestone.id);
    });
  });
});
