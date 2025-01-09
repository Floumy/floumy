import { Feature } from './feature.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Org } from '../../orgs/org.entity';
import { User } from '../../users/user.entity';
import { Project } from '../../projects/project.entity';
import { setupTestingModule } from '../../../test/test.utils';
import { FeaturesService } from './features.service';
import { UsersService } from '../../users/users.service';
import { OrgsService } from '../../orgs/orgs.service';
import { PaymentPlan } from '../../auth/payment.plan';
import { FeatureQueryBuilder } from './feature.query-builder';
import { OkrsService } from '../../okrs/okrs.service';
import { MilestonesService } from '../milestones/milestones.service';
import { WorkItemsService } from '../../backlog/work-items/work-items.service';
import { FeatureFile } from './feature-file.entity';
import { File } from '../../files/file.entity';
import { FilesService } from '../../files/files.service';
import { Iteration } from '../../iterations/Iteration.entity';
import { WorkItem } from '../../backlog/work-items/work-item.entity';
import { WorkItemFile } from '../../backlog/work-items/work-item-file.entity';
import { FilesStorageRepository } from '../../files/files-storage.repository';
import { FeatureStatus } from './featurestatus.enum';
import { Priority } from '../../common/priority.enum';

describe('FeatureQueryBuilder', () => {
  let featuresRepository: Repository<Feature>;
  let orgsRepository: Repository<Org>;
  let usersRepository: Repository<User>;
  let projectsRepository: Repository<Project>;

  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [
        TypeOrmModule.forFeature([
          Feature,
          Org,
          User,
          Project,
          FeatureFile,
          File,
          Iteration,
          WorkItem,
          WorkItemFile,
        ]),
      ],
      [
        FeaturesService,
        UsersService,
        OrgsService,
        OkrsService,
        MilestonesService,
        WorkItemsService,
        FilesService,
        FilesStorageRepository
      ],
    );
    cleanup = dbCleanup;
    featuresRepository = module.get<Repository<Feature>>(
      getRepositoryToken(Feature),
    );
    orgsRepository = module.get<Repository<Org>>(getRepositoryToken(Org));
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
    projectsRepository = module.get<Repository<Project>>(
      getRepositoryToken(Project),
    );
  });

  afterEach(async () => {
    await cleanup();
  });

  async function getTestPremiumOrgAndUser() {
    const premiumOrg = new Org();
    premiumOrg.name = 'Premium Org';
    premiumOrg.paymentPlan = PaymentPlan.PREMIUM;
    const org = await orgsRepository.save(premiumOrg);

    const premiumUser = new User(
      'Premium User',
      'premium@example.com',
      'testtesttest',
    );
    premiumUser.org = Promise.resolve(org);
    const user = await usersRepository.save(premiumUser);

    const project = new Project();
    project.name = 'Test Project';
    project.org = Promise.resolve(org);
    await projectsRepository.save(project);

    return { org, user, project };
  }

  describe('when executing a query with term and filters', () => {
    it('should return the features', async () => {
      const { org, user, project } = await getTestPremiumOrgAndUser();
      const feature = new Feature();
      feature.title = 'my feature';
      feature.description = 'my feature description';
      feature.status = FeatureStatus.COMPLETED;
      feature.priority = Priority.HIGH;
      feature.org = Promise.resolve(org);
      feature.project = Promise.resolve(project);
      feature.completedAt = new Date();
      feature.assignedTo = Promise.resolve(user);
      await featuresRepository.save(feature);

      const featureQueryBuilder = new FeatureQueryBuilder(
        org.id,
        project.id,
        {
          term: 'my feature',
        },
        featuresRepository,
        {
          status: ['completed'],
          priority: ['high'],
          assigneeIds: [user.id],
          completedAt: {
            start: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
            end: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
          },
        },
      );

      const features = await featureQueryBuilder.execute(1, 10);
      expect(features).toBeDefined();
      expect(features.length).toEqual(1);
      expect(features[0].id).toEqual(feature.id);
      expect(features[0].reference).toBeDefined();
      expect(features[0].title).toEqual(feature.title);
      expect(features[0].priority).toEqual(feature.priority);
      expect(features[0].status).toEqual(feature.status);
      expect(features[0].createdAt).toEqual(feature.createdAt);
      expect(features[0].updatedAt).toEqual(feature.updatedAt);
      expect(features[0].assignedTo.id).toEqual(user.id);
      expect(features[0].assignedTo.name).toEqual(user.name);
    });
  });

  describe('when executing a query with reference and filters', () => {
    it('should return the features', async () => {
      const { org, user, project } = await getTestPremiumOrgAndUser();
      const feature = new Feature();
      feature.title = 'my feature';
      feature.description = 'my feature description';
      feature.status = FeatureStatus.COMPLETED;
      feature.priority = Priority.HIGH;
      feature.org = Promise.resolve(org);
      feature.project = Promise.resolve(project);
      feature.completedAt = new Date();
      feature.assignedTo = Promise.resolve(user);

      const savedFeature = await featuresRepository.save(feature);

      const featureQueryBuilder = new FeatureQueryBuilder(
        org.id,
        project.id,
        {
          reference: savedFeature.reference,
        },
        featuresRepository,
        {
          status: ['completed'],
          priority: ['high'],
          assigneeIds: [user.id],
          completedAt: {
            start: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
            end: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
          },
        },
      );

      const features = await featureQueryBuilder.execute(1, 10);
      expect(features).toBeDefined();
      expect(features.length).toEqual(1);
      expect(features[0].id).toEqual(feature.id);
      expect(features[0].reference).toBeDefined();
      expect(features[0].title).toEqual(feature.title);
      expect(features[0].priority).toEqual(feature.priority);
      expect(features[0].status).toEqual(feature.status);
    });
  });

  describe('when counting the features', () => {
    it('should return the count', async () => {
      const { org, user, project } = await getTestPremiumOrgAndUser();
      const feature = new Feature();
      feature.title = 'my feature';
      feature.description = 'my feature description';
      feature.status = FeatureStatus.COMPLETED;
      feature.priority = Priority.HIGH;
      feature.org = Promise.resolve(org);
      feature.project = Promise.resolve(project);
      feature.completedAt = new Date();
      feature.assignedTo = Promise.resolve(user);
      await featuresRepository.save(feature);

      const featureQueryBuilder = new FeatureQueryBuilder(
        org.id,
        project.id,
        {
          term: 'my feature',
        },
        featuresRepository,
        {
          status: ['completed'],
          priority: ['high'],
          assigneeIds: [user.id],
          completedAt: {
            start: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
            end: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
          },
        },
      );

      const count = await featureQueryBuilder.count();
      expect(count).toEqual(1);
    });
  });
});
