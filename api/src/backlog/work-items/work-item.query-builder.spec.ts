import { WorkItemsService } from './work-items.service';
import { UsersService } from '../../users/users.service';
import { FeaturesService } from '../../roadmap/features/features.service';
import { MilestonesService } from '../../roadmap/milestones/milestones.service';
import { OkrsService } from '../../okrs/okrs.service';
import { OrgsService } from '../../orgs/orgs.service';
import { Org } from '../../orgs/org.entity';
import { setupTestingModule } from '../../../test/test.utils';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Objective } from '../../okrs/objective.entity';
import { KeyResult } from '../../okrs/key-result.entity';
import { Feature } from '../../roadmap/features/feature.entity';
import { User } from '../../users/user.entity';
import { Milestone } from '../../roadmap/milestones/milestone.entity';
import { Priority } from '../../common/priority.enum';
import { WorkItemType } from './work-item-type.enum';
import { Repository } from 'typeorm';
import { WorkItemStatus } from './work-item-status.enum';
import { Iteration } from '../../iterations/Iteration.entity';
import { WorkItem } from './work-item.entity';
import { IterationsService } from '../../iterations/iterations.service';
import { File } from '../../files/file.entity';
import { WorkItemFile } from './work-item-file.entity';
import { FeatureFile } from '../../roadmap/features/feature-file.entity';
import { FilesService } from '../../files/files.service';
import { FilesStorageRepository } from '../../files/files-storage.repository';
import { WorkItemComment } from './work-item-comment.entity';
import { PaymentPlan } from '../../auth/payment.plan';
import { IssuesService } from '../../issues/issues.service';
import { Project } from '../../projects/project.entity';
import { WorkItemQueryBuilder } from './work-item.query-builder';

describe('WorkItemQueryBuilder', () => {
  let workItemsRepository: Repository<WorkItem>;
  let orgsRepository: Repository<Org>;
  let usersRepository: Repository<User>;
  let projectsRepository: Repository<Project>;

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
          Iteration,
          WorkItem,
          File,
          FeatureFile,
          WorkItemFile,
          WorkItemComment,
        ]),
      ],
      [
        OkrsService,
        OrgsService,
        FeaturesService,
        UsersService,
        MilestonesService,
        WorkItemsService,
        IterationsService,
        FilesService,
        FilesStorageRepository,
        IssuesService,
      ],
    );
    cleanup = dbCleanup;
    workItemsRepository = module.get<Repository<WorkItem>>(
      getRepositoryToken(WorkItem),
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
    it('should return the work items', async () => {
      const { org, user, project } = await getTestPremiumOrgAndUser();
      const workItem = new WorkItem();
      workItem.title = 'my work item';
      workItem.description = 'my work item description';
      workItem.priority = Priority.HIGH;
      workItem.type = WorkItemType.USER_STORY;
      workItem.status = WorkItemStatus.DONE;
      workItem.org = Promise.resolve(org);
      workItem.createdBy = Promise.resolve(user);
      workItem.project = Promise.resolve(project);
      workItem.completedAt = new Date();
      workItem.assignedTo = Promise.resolve(user);
      await workItemsRepository.save(workItem);

      const workItemQueryBuilder = new WorkItemQueryBuilder(
        org.id,
        project.id,
        {
          term: 'my work item',
        },
        workItemsRepository,
        {
          status: [WorkItemStatus.DONE],
          priority: [Priority.HIGH],
          type: [WorkItemType.USER_STORY],
          assigneeIds: [user.id],
          completedAt: {
            start: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
            end: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
          },
        },
      );
      const workItems = await workItemQueryBuilder.execute(1, 10);
      expect(workItems).toBeDefined();
      expect(workItems.length).toEqual(1);
      expect(workItems[0].id).toEqual(workItem.id);
      expect(workItems[0].reference).toBeDefined();
      expect(workItems[0].title).toEqual(workItem.title);
      expect(workItems[0].description).toEqual(workItem.description);
      expect(workItems[0].priority).toEqual(workItem.priority);
      expect(workItems[0].type).toEqual(workItem.type);
      expect(workItems[0].status).toEqual(workItem.status);
      expect(workItems[0].estimation).toEqual(workItem.estimation);
      expect(workItems[0].completedAt).toEqual(workItem.completedAt);
      expect(workItems[0].createdAt).toEqual(workItem.createdAt);
      expect(workItems[0].updatedAt).toEqual(workItem.updatedAt);
      expect(workItems[0].assignedTo.id).toEqual(user.id);
      expect(workItems[0].assignedTo.name).toEqual(user.name);
    });
  });

  describe('when executing a query with reference and filters', () => {
    it('should return the work items', async () => {
      const { org, user, project } = await getTestPremiumOrgAndUser();
      const workItem = new WorkItem();
      workItem.title = 'my work item';
      workItem.description = 'my work item description';
      workItem.priority = Priority.HIGH;
      workItem.type = WorkItemType.USER_STORY;
      workItem.status = WorkItemStatus.DONE;
      workItem.org = Promise.resolve(org);
      workItem.createdBy = Promise.resolve(user);
      workItem.project = Promise.resolve(project);
      workItem.completedAt = new Date();
      workItem.assignedTo = Promise.resolve(user);
      await workItemsRepository.save(workItem);

      const savedWorkItem = await workItemsRepository.save(workItem);

      const workItemQueryBuilder = new WorkItemQueryBuilder(
        org.id,
        project.id,
        {
          reference: savedWorkItem.reference,
        },
        workItemsRepository,
        {
          status: [WorkItemStatus.DONE],
          priority: [Priority.HIGH],
          type: [WorkItemType.USER_STORY],
          assigneeIds: [user.id],
          completedAt: {
            start: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
            end: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
          },
        },
      );
      const workItems = await workItemQueryBuilder.execute(1, 10);
      expect(workItems).toBeDefined();
      expect(workItems.length).toEqual(1);
      expect(workItems[0].id).toEqual(workItem.id);
      expect(workItems[0].reference).toBeDefined();
      expect(workItems[0].title).toEqual(workItem.title);
      expect(workItems[0].description).toEqual(workItem.description);
      expect(workItems[0].priority).toEqual(workItem.priority);
      expect(workItems[0].type).toEqual(workItem.type);
      expect(workItems[0].status).toEqual(workItem.status);
      expect(workItems[0].estimation).toEqual(workItem.estimation);
      expect(workItems[0].completedAt).toEqual(workItem.completedAt);
      expect(workItems[0].createdAt).toEqual(workItem.createdAt);
      expect(workItems[0].updatedAt).toEqual(workItem.updatedAt);
    });
  });

  describe('when counting the work items', () => {
    it('should return the count', async () => {
      const { org, user, project } = await getTestPremiumOrgAndUser();
      const workItem = new WorkItem();
      workItem.title = 'my work item';
      workItem.description = 'my work item description';
      workItem.priority = Priority.HIGH;
      workItem.type = WorkItemType.USER_STORY;
      workItem.status = WorkItemStatus.DONE;
      workItem.org = Promise.resolve(org);
      workItem.createdBy = Promise.resolve(user);
      workItem.project = Promise.resolve(project);
      workItem.completedAt = new Date();
      workItem.assignedTo = Promise.resolve(user);
      await workItemsRepository.save(workItem);

      const workItemQueryBuilder = new WorkItemQueryBuilder(
        org.id,
        project.id,
        {
          term: 'my work item',
        },
        workItemsRepository,
        {
          status: [WorkItemStatus.DONE],
          priority: [Priority.HIGH],
          type: [WorkItemType.USER_STORY],
          assigneeIds: [user.id],
          completedAt: {
            start: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
            end: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
          },
        },
      );
      const count = await workItemQueryBuilder.count();
      expect(count).toEqual(1);
    });
  });
});
