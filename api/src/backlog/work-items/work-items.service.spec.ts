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
import { EntityNotFoundError, Repository } from 'typeorm';
import { WorkItemStatus } from './work-item-status.enum';
import { FeatureStatus } from '../../roadmap/features/featurestatus.enum';
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

describe('WorkItemsService', () => {
  let usersService: UsersService;
  let orgsService: OrgsService;
  let featuresService: FeaturesService;
  let iterationService: IterationsService;
  let filesRepository: Repository<File>;
  let workItemCommentsRepository: Repository<WorkItemComment>;
  let workItemsRepository: Repository<WorkItem>;
  let service: WorkItemsService;
  let orgsRepository: Repository<Org>;
  let usersRepository: Repository<User>;
  let projectsRepository: Repository<Project>;
  let org: Org;
  let user: User;
  let issuesService: IssuesService;
  let project: Project;

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
    service = module.get<WorkItemsService>(WorkItemsService);
    iterationService = module.get<IterationsService>(IterationsService);
    featuresService = module.get<FeaturesService>(FeaturesService);
    orgsService = module.get<OrgsService>(OrgsService);
    usersService = module.get<UsersService>(UsersService);
    filesRepository = module.get<Repository<File>>(getRepositoryToken(File));
    workItemCommentsRepository = module.get<Repository<WorkItemComment>>(
      getRepositoryToken(WorkItemComment),
    );
    workItemsRepository = module.get<Repository<WorkItem>>(
      getRepositoryToken(WorkItem),
    );
    orgsRepository = module.get<Repository<Org>>(getRepositoryToken(Org));
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
    issuesService = module.get<IssuesService>(IssuesService);
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

  describe('when creating a work item', () => {
    it('should return the created work item', async () => {
      const feature = await featuresService.createFeature(
        org.id,
        project.id,
        user.id,
        {
          title: 'my feature',
          description: 'my feature description',
          priority: Priority.HIGH,
          status: FeatureStatus.PLANNED,
        },
      );
      const workItem = await service.createWorkItem(
        org.id,
        project.id,
        user.id,
        {
          title: 'my work item',
          description: 'my work item description',
          priority: Priority.HIGH,
          type: WorkItemType.USER_STORY,
          feature: feature.id,
          status: WorkItemStatus.PLANNED,
        },
      );
      expect(workItem).toBeDefined();
      expect(workItem.id).toBeDefined();
      expect(workItem.title).toEqual('my work item');
      expect(workItem.description).toEqual('my work item description');
      expect(workItem.priority).toEqual(Priority.HIGH);
      expect(workItem.type).toEqual(WorkItemType.USER_STORY);
      expect(workItem.feature.id).toBeDefined();
      expect(workItem.feature.title).toEqual('my feature');
      expect(workItem.createdBy.id).toEqual(user.id);
      expect(workItem.createdBy.name).toEqual(user.name);
    });
    it('should update the feature progress', async () => {
      const feature = await featuresService.createFeature(
        org.id,
        project.id,
        user.id,
        {
          title: 'my feature',
          description: 'my feature description',
          priority: Priority.HIGH,
          status: FeatureStatus.IN_PROGRESS,
        },
      );
      await service.createWorkItem(org.id, project.id, user.id, {
        title: 'my work item',
        description: 'my work item description',
        priority: Priority.HIGH,
        type: WorkItemType.USER_STORY,
        estimation: 13,
        feature: feature.id,
        status: WorkItemStatus.DONE,
      });
      await service.createWorkItem(org.id, project.id, user.id, {
        title: 'my other work item',
        description: 'my other work item description',
        priority: Priority.MEDIUM,
        type: WorkItemType.TECHNICAL_DEBT,
        estimation: 13,
        feature: feature.id,
        status: WorkItemStatus.IN_PROGRESS,
      });
      const foundFeature = await featuresService.getFeature(
        org.id,
        project.id,
        feature.id,
      );
      expect(foundFeature.progress).toEqual(50);
    });
    it('should create the work item with files', async () => {
      const file1 = new File();
      file1.name = 'file1';
      file1.size = 100;
      file1.type = 'text/plain';
      file1.path = '/path/to/file1';
      file1.url = 'https://example.com/file1';
      file1.org = Promise.resolve(org);
      file1.project = Promise.resolve(project);
      const savedFile1 = await filesRepository.save(file1);
      const file2 = new File();
      file2.name = 'file2';
      file2.size = 100;
      file2.type = 'text/plain';
      file2.path = '/path/to/file1';
      file2.url = 'https://example.com/file1';
      file2.org = Promise.resolve(org);
      file2.project = Promise.resolve(project);
      const savedFile2 = await filesRepository.save(file2);
      const workItem = await service.createWorkItem(
        org.id,
        project.id,
        user.id,
        {
          title: 'my work item',
          description: 'my work item description',
          priority: Priority.HIGH,
          type: WorkItemType.USER_STORY,
          estimation: 13,
          status: WorkItemStatus.DONE,
          files: [
            {
              id: savedFile1.id,
            },
            {
              id: savedFile2.id,
            },
          ],
        },
      );
      expect(workItem).toBeDefined();
      expect(workItem.id).toBeDefined();
      expect(workItem.title).toEqual('my work item');
      expect(workItem.description).toEqual('my work item description');
      expect(workItem.priority).toEqual(Priority.HIGH);
      expect(workItem.type).toEqual(WorkItemType.USER_STORY);
      expect(workItem.estimation).toEqual(13);
      expect(workItem.status).toEqual(WorkItemStatus.DONE);
      expect(workItem.files).toBeDefined();
      expect(workItem.files.length).toEqual(2);
      expect(workItem.files[0].id).toEqual(savedFile1.id);
      expect(workItem.files[1].id).toEqual(savedFile2.id);
    });
    it('should create a work item with an issue', async () => {
      org.paymentPlan = PaymentPlan.PREMIUM;
      await orgsRepository.save(org);
      const issue = await issuesService.addIssue(user.id, org.id, project.id, {
        title: 'My Issue',
        description: 'My Issue Description',
      });
      const workItem = await service.createWorkItem(
        org.id,
        project.id,
        user.id,
        {
          title: 'my work item',
          description: 'my work item description',
          priority: Priority.HIGH,
          type: WorkItemType.USER_STORY,
          issue: issue.id,
          status: WorkItemStatus.PLANNED,
        },
      );
      expect(workItem.issue).toBeDefined();
      expect(workItem.issue.id).toEqual(issue.id);
    });
  });
  describe('when listing work items', () => {
    it('should return the list of work items', async () => {
      const feature = await featuresService.createFeature(
        org.id,
        project.id,
        user.id,
        {
          title: 'my feature',
          description: 'my feature description',
          priority: Priority.HIGH,
          status: FeatureStatus.PLANNED,
        },
      );
      await service.createWorkItem(org.id, project.id, user.id, {
        title: 'my work item',
        description: 'my work item description',
        priority: Priority.HIGH,
        type: WorkItemType.USER_STORY,
        feature: feature.id,
        status: WorkItemStatus.PLANNED,
      });
      const workItems = await service.listWorkItems(org.id, project.id);
      expect(workItems).toBeDefined();
      expect(workItems.length).toEqual(1);
      expect(workItems[0].title).toEqual('my work item');
      expect(workItems[0].description).toEqual('my work item description');
      expect(workItems[0].priority).toEqual(Priority.HIGH);
      expect(workItems[0].type).toEqual(WorkItemType.USER_STORY);
    });
    it('should return the list of work items paginated', async () => {
      const feature1 = await featuresService.createFeature(
        org.id,
        project.id,
        user.id,
        {
          title: 'my feature',
          description: 'my feature description',
          priority: Priority.HIGH,
          status: FeatureStatus.PLANNED,
        },
      );
      const feature2 = await featuresService.createFeature(
        org.id,
        project.id,
        user.id,
        {
          title: 'my other feature',
          description: 'my other feature description',
          priority: Priority.MEDIUM,
          status: FeatureStatus.PLANNED,
        },
      );
      await service.createWorkItem(org.id, project.id, user.id, {
        title: 'my work item',
        description: 'my work item description',
        priority: Priority.HIGH,
        type: WorkItemType.USER_STORY,
        feature: feature1.id,
        status: WorkItemStatus.PLANNED,
      });
      await service.createWorkItem(org.id, project.id, user.id, {
        title: 'my other work item',
        description: 'my other work item description',
        priority: Priority.MEDIUM,
        type: WorkItemType.TECHNICAL_DEBT,
        feature: feature2.id,
        status: WorkItemStatus.PLANNED,
      });
      const workItems = await service.listWorkItems(org.id, project.id, 1, 1);
      expect(workItems).toBeDefined();
      expect(workItems.length).toEqual(1);
      expect(workItems[0].title).toEqual('my work item');
      expect(workItems[0].description).toEqual('my work item description');
      expect(workItems[0].priority).toEqual(Priority.HIGH);
      expect(workItems[0].type).toEqual(WorkItemType.USER_STORY);
    });
  });
  describe('when getting a work item', () => {
    it('should return the work item', async () => {
      const feature = await featuresService.createFeature(
        org.id,
        project.id,
        user.id,
        {
          title: 'my feature',
          description: 'my feature description',
          priority: Priority.HIGH,
          status: FeatureStatus.PLANNED,
        },
      );
      const workItem = await service.createWorkItem(
        org.id,
        project.id,
        user.id,
        {
          title: 'my work item',
          description: 'my work item description',
          priority: Priority.HIGH,
          type: WorkItemType.USER_STORY,
          feature: feature.id,
          status: WorkItemStatus.PLANNED,
        },
      );
      const foundWorkItem = await service.getWorkItem(
        org.id,
        project.id,
        workItem.id,
      );
      expect(foundWorkItem).toBeDefined();
      expect(foundWorkItem.title).toEqual('my work item');
      expect(foundWorkItem.description).toEqual('my work item description');
      expect(foundWorkItem.priority).toEqual(Priority.HIGH);
      expect(foundWorkItem.type).toEqual(WorkItemType.USER_STORY);
      expect(foundWorkItem.feature.id).toBeDefined();
      expect(foundWorkItem.feature.title).toEqual('my feature');
    });
  });
  describe('when updating a work item', () => {
    it('should return the updated work item', async () => {
      const feature1 = await featuresService.createFeature(
        org.id,
        project.id,
        user.id,
        {
          title: 'my feature',
          description: 'my feature description',
          priority: Priority.HIGH,
          status: FeatureStatus.PLANNED,
        },
      );
      const feature2 = await featuresService.createFeature(
        org.id,
        project.id,
        user.id,
        {
          title: 'my other feature',
          description: 'my other feature description',
          priority: Priority.MEDIUM,
          status: FeatureStatus.PLANNED,
        },
      );
      const workItem = await service.createWorkItem(
        org.id,
        project.id,
        user.id,
        {
          title: 'my work item',
          description: 'my work item description',
          priority: Priority.HIGH,
          type: WorkItemType.USER_STORY,
          feature: feature1.id,
          status: WorkItemStatus.PLANNED,
        },
      );
      const foundWorkItem = await service.updateWorkItem(
        org.id,
        project.id,
        workItem.id,
        {
          title: 'my work item updated',
          description: 'my work item description updated',
          priority: Priority.MEDIUM,
          type: WorkItemType.TECHNICAL_DEBT,
          feature: feature2.id,
          status: WorkItemStatus.PLANNED,
        },
      );
      expect(foundWorkItem).toBeDefined();
      expect(foundWorkItem.title).toEqual('my work item updated');
      expect(foundWorkItem.description).toEqual(
        'my work item description updated',
      );
      expect(foundWorkItem.priority).toEqual(Priority.MEDIUM);
      expect(foundWorkItem.type).toEqual(WorkItemType.TECHNICAL_DEBT);
      expect(foundWorkItem.feature.id).toBeDefined();
      expect(foundWorkItem.feature.title).toEqual('my other feature');
    });
    it('should remove the association with the feature if the feature is not provided', async () => {
      const feature = await featuresService.createFeature(
        org.id,
        project.id,
        user.id,
        {
          title: 'my feature',
          description: 'my feature description',
          priority: Priority.HIGH,
          status: FeatureStatus.PLANNED,
        },
      );
      const workItem = await service.createWorkItem(
        org.id,
        project.id,
        user.id,
        {
          title: 'my work item',
          description: 'my work item description',
          priority: Priority.HIGH,
          type: WorkItemType.USER_STORY,
          feature: feature.id,
          status: WorkItemStatus.PLANNED,
        },
      );
      const foundWorkItem = await service.updateWorkItem(
        org.id,
        project.id,
        workItem.id,
        {
          title: 'my work item updated',
          description: 'my work item description updated',
          priority: Priority.MEDIUM,
          type: WorkItemType.TECHNICAL_DEBT,
          status: WorkItemStatus.PLANNED,
        },
      );
      expect(foundWorkItem).toBeDefined();
      expect(foundWorkItem.title).toEqual('my work item updated');
      expect(foundWorkItem.description).toEqual(
        'my work item description updated',
      );
      expect(foundWorkItem.priority).toEqual(Priority.MEDIUM);
      expect(foundWorkItem.type).toEqual(WorkItemType.TECHNICAL_DEBT);
      expect(foundWorkItem.feature).toBeUndefined();
    });
    it('should update the completedAt field if the status is DONE', async () => {
      const workItem = await service.createWorkItem(
        org.id,
        project.id,
        user.id,
        {
          title: 'my work item',
          description: 'my work item description',
          priority: Priority.HIGH,
          type: WorkItemType.USER_STORY,
          status: WorkItemStatus.PLANNED,
        },
      );
      const foundWorkItem = await service.updateWorkItem(
        org.id,
        project.id,
        workItem.id,
        {
          title: 'my work item updated',
          description: 'my work item description updated',
          priority: Priority.MEDIUM,
          type: WorkItemType.TECHNICAL_DEBT,
          status: WorkItemStatus.DONE,
        },
      );
      expect(foundWorkItem).toBeDefined();
      expect(foundWorkItem.title).toEqual('my work item updated');
      expect(foundWorkItem.description).toEqual(
        'my work item description updated',
      );
      expect(foundWorkItem.priority).toEqual(Priority.MEDIUM);
      expect(foundWorkItem.type).toEqual(WorkItemType.TECHNICAL_DEBT);
      expect(foundWorkItem.completedAt).toBeDefined();
    });
    it('should update the completedAt field if the status is CLOSED', async () => {
      const workItem = await service.createWorkItem(
        org.id,
        project.id,
        user.id,
        {
          title: 'my work item',
          description: 'my work item description',
          priority: Priority.HIGH,
          type: WorkItemType.USER_STORY,
          status: WorkItemStatus.PLANNED,
        },
      );
      const foundWorkItem = await service.updateWorkItem(
        org.id,
        project.id,
        workItem.id,
        {
          title: 'my work item updated',
          description: 'my work item description updated',
          priority: Priority.MEDIUM,
          type: WorkItemType.TECHNICAL_DEBT,
          status: WorkItemStatus.CLOSED,
        },
      );
      expect(foundWorkItem).toBeDefined();
      expect(foundWorkItem.title).toEqual('my work item updated');
      expect(foundWorkItem.description).toEqual(
        'my work item description updated',
      );
      expect(foundWorkItem.priority).toEqual(Priority.MEDIUM);
      expect(foundWorkItem.type).toEqual(WorkItemType.TECHNICAL_DEBT);
      expect(foundWorkItem.completedAt).toBeDefined();
    });
    it('should update the work item files', async () => {
      const file1 = new File();
      file1.name = 'file1';
      file1.size = 100;
      file1.type = 'text/plain';
      file1.path = '/path/to/file1';
      file1.url = 'https://example.com/file1';
      file1.org = Promise.resolve(org);
      file1.project = Promise.resolve(project);
      const savedFile1 = await filesRepository.save(file1);
      const file2 = new File();
      file2.name = 'file2';
      file2.size = 100;
      file2.type = 'text/plain';
      file2.path = '/path/to/file1';
      file2.url = 'https://example.com/file1';
      file2.org = Promise.resolve(org);
      file2.project = Promise.resolve(project);
      const savedFile2 = await filesRepository.save(file2);
      const workItem = await service.createWorkItem(
        org.id,
        project.id,
        user.id,
        {
          title: 'my work item',
          description: 'my work item description',
          priority: Priority.HIGH,
          type: WorkItemType.USER_STORY,
          estimation: 13,
          status: WorkItemStatus.DONE,
          files: [
            {
              id: savedFile1.id,
            },
            {
              id: savedFile2.id,
            },
          ],
        },
      );
      const foundWorkItem = await service.updateWorkItem(
        org.id,
        project.id,
        workItem.id,
        {
          title: 'my work item updated',
          description: 'my work item description updated',
          priority: Priority.MEDIUM,
          type: WorkItemType.TECHNICAL_DEBT,
          estimation: 13,
          status: WorkItemStatus.DONE,
          files: [
            {
              id: savedFile1.id,
            },
          ],
        },
      );
      expect(foundWorkItem).toBeDefined();
      expect(foundWorkItem.title).toEqual('my work item updated');
      expect(foundWorkItem.description).toEqual(
        'my work item description updated',
      );
      expect(foundWorkItem.priority).toEqual(Priority.MEDIUM);
      expect(foundWorkItem.type).toEqual(WorkItemType.TECHNICAL_DEBT);
      expect(foundWorkItem.estimation).toEqual(13);
      expect(foundWorkItem.status).toEqual(WorkItemStatus.DONE);
      expect(foundWorkItem.files).toBeDefined();
      expect(foundWorkItem.files.length).toEqual(1);
      expect(foundWorkItem.files[0].id).toEqual(savedFile1.id);
    });
    it('should add the work item assignment to the user', async () => {
      const otherUser = await usersService.createUserWithOrg(
        'Other User',
        'testing@example.com',
        'testtesttest',
        org.invitationToken,
      );
      const workItem = await service.createWorkItem(
        org.id,
        project.id,
        user.id,
        {
          title: 'my work item',
          description: 'my work item description',
          priority: Priority.HIGH,
          type: WorkItemType.USER_STORY,
          status: WorkItemStatus.PLANNED,
        },
      );
      const foundWorkItem = await service.updateWorkItem(
        org.id,
        project.id,
        workItem.id,
        {
          title: 'my work item updated',
          description: 'my work item description updated',
          priority: Priority.MEDIUM,
          type: WorkItemType.TECHNICAL_DEBT,
          status: WorkItemStatus.PLANNED,
          assignedTo: otherUser.id,
        },
      );
      expect(foundWorkItem).toBeDefined();
      expect(foundWorkItem.title).toEqual('my work item updated');
      expect(foundWorkItem.description).toEqual(
        'my work item description updated',
      );
      expect(foundWorkItem.priority).toEqual(Priority.MEDIUM);
      expect(foundWorkItem.type).toEqual(WorkItemType.TECHNICAL_DEBT);
      expect(foundWorkItem.assignedTo).toBeDefined();
      expect(foundWorkItem.assignedTo.id).toEqual(otherUser.id);
      expect(foundWorkItem.assignedTo.name).toEqual(otherUser.name);
    });
    it('should remove the work item assignment if the assignedTo field is not provided', async () => {
      const otherUser = await usersService.createUserWithOrg(
        'Other User',
        'other.user@example.com',
        'testtesttest',
        org.invitationToken,
      );
      const workItem = await service.createWorkItem(
        org.id,
        project.id,
        user.id,
        {
          title: 'my work item',
          description: 'my work item description',
          priority: Priority.HIGH,
          type: WorkItemType.USER_STORY,
          status: WorkItemStatus.PLANNED,
          assignedTo: otherUser.id,
        },
      );
      const foundWorkItem = await service.updateWorkItem(
        org.id,
        project.id,
        workItem.id,
        {
          title: 'my work item updated',
          description: 'my work item description updated',
          priority: Priority.MEDIUM,
          type: WorkItemType.TECHNICAL_DEBT,
          status: WorkItemStatus.PLANNED,
        },
      );
      expect(foundWorkItem).toBeDefined();
      expect(foundWorkItem.title).toEqual('my work item updated');
      expect(foundWorkItem.description).toEqual(
        'my work item description updated',
      );
      expect(foundWorkItem.priority).toEqual(Priority.MEDIUM);
      expect(foundWorkItem.type).toEqual(WorkItemType.TECHNICAL_DEBT);
      expect(foundWorkItem.assignedTo).toBeUndefined();
    });
  });
  describe('when deleting a work item', () => {
    it('should delete the work item', async () => {
      const feature = await featuresService.createFeature(
        org.id,
        project.id,
        user.id,
        {
          title: 'my feature',
          description: 'my feature description',
          priority: Priority.HIGH,
          status: FeatureStatus.PLANNED,
        },
      );
      const workItem = await service.createWorkItem(
        org.id,
        project.id,
        user.id,
        {
          title: 'my work item',
          description: 'my work item description',
          priority: Priority.HIGH,
          type: WorkItemType.USER_STORY,
          feature: feature.id,
          status: WorkItemStatus.PLANNED,
        },
      );
      await service.deleteWorkItem(org.id, project.id, workItem.id);
      await expect(
        service.getWorkItem(org.id, project.id, workItem.id),
      ).rejects.toThrow(EntityNotFoundError);
    });
    it("should delete the work item's files", async () => {
      const file1 = new File();
      file1.name = 'file1';
      file1.size = 100;
      file1.type = 'text/plain';
      file1.path = '/path/to/file1';
      file1.url = 'https://example.com/file1';
      file1.org = Promise.resolve(org);
      file1.project = Promise.resolve(project);
      const savedFile1 = await filesRepository.save(file1);
      const file2 = new File();
      file2.name = 'file2';
      file2.size = 100;
      file2.type = 'text/plain';
      file2.path = '/path/to/file1';
      file2.url = 'https://example.com/file1';
      file2.org = Promise.resolve(org);
      file2.project = Promise.resolve(project);
      const savedFile2 = await filesRepository.save(file2);
      const workItem = await service.createWorkItem(
        org.id,
        project.id,
        user.id,
        {
          title: 'my work item',
          description: 'my work item description',
          priority: Priority.HIGH,
          type: WorkItemType.USER_STORY,
          estimation: 13,
          status: WorkItemStatus.DONE,
          files: [
            {
              id: savedFile1.id,
            },
            {
              id: savedFile2.id,
            },
          ],
        },
      );
      await service.deleteWorkItem(org.id, project.id, workItem.id);
      await expect(
        filesRepository.findOneByOrFail({ id: savedFile1.id }),
      ).rejects.toThrow(EntityNotFoundError);
      await expect(
        filesRepository.findOneByOrFail({ id: savedFile2.id }),
      ).rejects.toThrow(EntityNotFoundError);
    });
    it('should update the issue', async () => {
      org.paymentPlan = PaymentPlan.PREMIUM;
      await orgsRepository.save(org);
      const issue = await issuesService.addIssue(user.id, org.id, project.id, {
        title: 'My Issue',
        description: 'My Issue Description',
      });
      const workItem = await service.createWorkItem(
        org.id,
        project.id,
        user.id,
        {
          title: 'my work item',
          description: 'my work item description',
          priority: Priority.HIGH,
          type: WorkItemType.USER_STORY,
          issue: issue.id,
          status: WorkItemStatus.PLANNED,
        },
      );
      const updatedWorkItem = await service.updateWorkItem(
        org.id,
        project.id,
        workItem.id,
        {
          title: 'my work item updated',
          description: 'my work item description updated',
          priority: Priority.LOW,
          type: WorkItemType.BUG,
          issue: issue.id,
          status: WorkItemStatus.PLANNED,
        },
      );
      expect(updatedWorkItem.issue).toBeDefined();
      expect(updatedWorkItem.issue.id).toEqual(issue.id);
    });
    it('should update the issue to null', async () => {
      org.paymentPlan = PaymentPlan.PREMIUM;
      await orgsRepository.save(org);
      const issue = await issuesService.addIssue(user.id, org.id, project.id, {
        title: 'My Issue',
        description: 'My Issue Description',
      });
      const workItem = await service.createWorkItem(
        org.id,
        project.id,
        user.id,
        {
          title: 'my work item',
          description: 'my work item description',
          priority: Priority.HIGH,
          type: WorkItemType.USER_STORY,
          issue: issue.id,
          status: WorkItemStatus.PLANNED,
        },
      );
      const updatedWorkItem = await service.updateWorkItem(
        org.id,
        project.id,
        workItem.id,
        {
          title: 'my work item updated',
          description: 'my work item description updated',
          priority: Priority.LOW,
          type: WorkItemType.BUG,
          issue: null,
          status: WorkItemStatus.PLANNED,
        },
      );
      expect(updatedWorkItem.issue).toBeUndefined();
    });
  });
  describe('when listing open work items', () => {
    it('should return the list of open work items', async () => {
      const feature1 = await featuresService.createFeature(
        org.id,
        project.id,
        user.id,
        {
          title: 'my feature',
          description: 'my feature description',
          priority: Priority.HIGH,
          status: FeatureStatus.PLANNED,
        },
      );
      const feature2 = await featuresService.createFeature(
        org.id,
        project.id,
        user.id,
        {
          title: 'my other feature',
          description: 'my other feature description',
          priority: Priority.MEDIUM,
          status: FeatureStatus.PLANNED,
        },
      );
      await service.createWorkItem(org.id, project.id, user.id, {
        title: 'my work item',
        description: 'my work item description',
        priority: Priority.HIGH,
        type: WorkItemType.USER_STORY,
        feature: feature1.id,
        status: WorkItemStatus.PLANNED,
      });
      await service.createWorkItem(org.id, project.id, user.id, {
        title: 'my other work item',
        description: 'my other work item description',
        priority: Priority.MEDIUM,
        type: WorkItemType.TECHNICAL_DEBT,
        feature: feature2.id,
        status: WorkItemStatus.PLANNED,
      });
      const workItems = await service.listOpenWorkItemsWithoutIterations(
        org.id,
        project.id,
      );
      expect(workItems).toBeDefined();
      expect(workItems).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            title: 'my work item',
            description: 'my work item description',
            priority: Priority.HIGH,
            type: WorkItemType.USER_STORY,
            feature: expect.objectContaining({
              id: expect.any(String), // or whatever type id is
              title: 'my feature',
            }),
          }),
          expect.objectContaining({
            title: 'my other work item',
            description: 'my other work item description',
            priority: Priority.MEDIUM,
            type: WorkItemType.TECHNICAL_DEBT,
            feature: expect.objectContaining({
              id: expect.any(String),
              title: 'my other feature',
            }),
          }),
        ]),
      );
    });
    it('should return the open work items that are not associated with an iteration', async () => {
      const iteration = await iterationService.create(org.id, project.id, {
        goal: 'my iteration description',
        startDate: '2020-01-01',
        duration: 7,
      });
      const feature1 = await featuresService.createFeature(
        org.id,
        project.id,
        user.id,
        {
          title: 'my feature',
          description: 'my feature description',
          priority: Priority.HIGH,
          status: FeatureStatus.PLANNED,
        },
      );
      const feature2 = await featuresService.createFeature(
        org.id,
        project.id,
        user.id,
        {
          title: 'my other feature',
          description: 'my other feature description',
          priority: Priority.MEDIUM,
          status: FeatureStatus.PLANNED,
        },
      );
      await service.createWorkItem(org.id, project.id, user.id, {
        title: 'my work item',
        description: 'my work item description',
        priority: Priority.HIGH,
        type: WorkItemType.USER_STORY,
        feature: feature1.id,
        status: WorkItemStatus.PLANNED,
        iteration: iteration.id,
      });
      await service.createWorkItem(org.id, project.id, user.id, {
        title: 'my other work item',
        description: 'my other work item description',
        priority: Priority.MEDIUM,
        type: WorkItemType.TECHNICAL_DEBT,
        feature: feature2.id,
        status: WorkItemStatus.PLANNED,
      });
      const workItems = await service.listOpenWorkItemsWithoutIterations(
        org.id,
        project.id,
      );
      expect(workItems).toBeDefined();
      expect(workItems.length).toEqual(1);
      expect(workItems[0].title).toEqual('my other work item');
      expect(workItems[0].description).toEqual(
        'my other work item description',
      );
      expect(workItems[0].priority).toEqual(Priority.MEDIUM);
      expect(workItems[0].type).toEqual(WorkItemType.TECHNICAL_DEBT);
      expect(workItems[0].feature.id).toBeDefined();
      expect(workItems[0].feature.title).toEqual('my other feature');
    });
  });
  describe('when creating a work item with a feature', () => {
    it('should update the feature progress', async () => {
      const feature = await featuresService.createFeature(
        org.id,
        project.id,
        user.id,
        {
          title: 'my feature',
          description: 'my feature description',
          priority: Priority.HIGH,
          status: FeatureStatus.IN_PROGRESS,
        },
      );
      await service.createWorkItem(org.id, project.id, user.id, {
        title: 'my work item',
        description: 'my work item description',
        priority: Priority.HIGH,
        type: WorkItemType.USER_STORY,
        feature: feature.id,
        estimation: 13,
        status: WorkItemStatus.DONE,
      });
      await service.createWorkItem(org.id, project.id, user.id, {
        title: 'my other work item',
        description: 'my other work item description',
        priority: Priority.MEDIUM,
        type: WorkItemType.TECHNICAL_DEBT,
        feature: feature.id,
        estimation: 13,
        status: WorkItemStatus.IN_PROGRESS,
      });
      const foundFeature = await featuresService.getFeature(
        org.id,
        project.id,
        feature.id,
      );
      expect(foundFeature.progress).toEqual(50);
    });
    it('should update the feature workItemsCount', async () => {
      const feature = await featuresService.createFeature(
        org.id,
        project.id,
        user.id,
        {
          title: 'my feature',
          description: 'my feature description',
          priority: Priority.HIGH,
          status: FeatureStatus.IN_PROGRESS,
        },
      );
      await service.createWorkItem(org.id, project.id, user.id, {
        title: 'my work item',
        description: 'my work item description',
        priority: Priority.HIGH,
        type: WorkItemType.USER_STORY,
        feature: feature.id,
        estimation: 13,
        status: WorkItemStatus.DONE,
      });
      await service.createWorkItem(org.id, project.id, user.id, {
        title: 'my other work item',
        description: 'my other work item description',
        priority: Priority.MEDIUM,
        type: WorkItemType.TECHNICAL_DEBT,
        feature: feature.id,
        estimation: 13,
        status: WorkItemStatus.IN_PROGRESS,
      });
      const foundFeature = await featuresService.getFeature(
        org.id,
        project.id,
        feature.id,
      );
      expect(foundFeature.workItemsCount).toEqual(2);
    });
  });
  describe('when updating a work item with a feature', () => {
    it('should update the feature progress', async () => {
      const feature = await featuresService.createFeature(
        org.id,
        project.id,
        user.id,
        {
          title: 'my feature',
          description: 'my feature description',
          priority: Priority.HIGH,
          status: FeatureStatus.IN_PROGRESS,
        },
      );
      const workItem1 = await service.createWorkItem(
        org.id,
        project.id,
        user.id,
        {
          title: 'my work item',
          description: 'my work item description',
          priority: Priority.HIGH,
          type: WorkItemType.USER_STORY,
          estimation: 13,
          feature: feature.id,
          status: WorkItemStatus.DONE,
        },
      );
      const workItem2 = await service.createWorkItem(
        org.id,
        project.id,
        user.id,
        {
          title: 'my other work item',
          description: 'my other work item description',
          priority: Priority.MEDIUM,
          type: WorkItemType.TECHNICAL_DEBT,
          estimation: 13,
          status: WorkItemStatus.IN_PROGRESS,
        },
      );
      await service.updateWorkItem(org.id, project.id, workItem1.id, {
        title: 'my work item',
        description: 'my work item description',
        priority: Priority.HIGH,
        type: WorkItemType.USER_STORY,
        estimation: 13,
        status: WorkItemStatus.DONE,
        feature: feature.id,
      });
      await service.updateWorkItem(org.id, project.id, workItem2.id, {
        title: 'my other work item',
        description: 'my other work item description',
        priority: Priority.MEDIUM,
        type: WorkItemType.TECHNICAL_DEBT,
        estimation: 13,
        status: WorkItemStatus.IN_PROGRESS,
        feature: feature.id,
      });
      const foundFeature = await featuresService.getFeature(
        org.id,
        project.id,
        feature.id,
      );
      expect(foundFeature.progress).toEqual(50);
    });
    it('should update the feature workItemsCount', async () => {
      const feature = await featuresService.createFeature(
        org.id,
        project.id,
        user.id,
        {
          title: 'my feature',
          description: 'my feature description',
          priority: Priority.HIGH,
          status: FeatureStatus.IN_PROGRESS,
        },
      );
      const workItem1 = await service.createWorkItem(
        org.id,
        project.id,
        user.id,
        {
          title: 'my work item',
          description: 'my work item description',
          priority: Priority.HIGH,
          type: WorkItemType.USER_STORY,
          estimation: 13,
          feature: feature.id,
          status: WorkItemStatus.DONE,
        },
      );
      const workItem2 = await service.createWorkItem(
        org.id,
        project.id,
        user.id,
        {
          title: 'my other work item',
          description: 'my other work item description',
          priority: Priority.MEDIUM,
          type: WorkItemType.TECHNICAL_DEBT,
          estimation: 13,
          feature: feature.id,
          status: WorkItemStatus.IN_PROGRESS,
        },
      );
      await service.updateWorkItem(org.id, project.id, workItem1.id, {
        title: 'my work item',
        description: 'my work item description',
        priority: Priority.HIGH,
        type: WorkItemType.USER_STORY,
        estimation: 13,
        status: WorkItemStatus.DONE,
        feature: feature.id,
      });
      await service.updateWorkItem(org.id, project.id, workItem2.id, {
        title: 'my other work item',
        description: 'my other work item description',
        priority: Priority.MEDIUM,
        type: WorkItemType.TECHNICAL_DEBT,
        estimation: 13,
        status: WorkItemStatus.IN_PROGRESS,
        feature: null,
      });
      const foundFeature = await featuresService.getFeature(
        org.id,
        project.id,
        feature.id,
      );
      expect(foundFeature.workItemsCount).toEqual(1);
    });
    it('should update the feature progress and count when changing the feature of a work item', async () => {
      const feature1 = await featuresService.createFeature(
        org.id,
        project.id,
        user.id,
        {
          title: 'my feature 1',
          description: 'my feature description 1',
          priority: Priority.HIGH,
          status: FeatureStatus.IN_PROGRESS,
        },
      );
      const feature2 = await featuresService.createFeature(
        org.id,
        project.id,
        user.id,
        {
          title: 'my feature 2',
          description: 'my feature description 2',
          priority: Priority.HIGH,
          status: FeatureStatus.IN_PROGRESS,
        },
      );
      const workItem1 = await service.createWorkItem(
        org.id,
        project.id,
        user.id,
        {
          title: 'my work item 1',
          description: 'my work item description 1',
          priority: Priority.HIGH,
          type: WorkItemType.USER_STORY,
          estimation: 13,
          feature: feature1.id,
          status: WorkItemStatus.DONE,
        },
      );
      const workItem2 = await service.createWorkItem(
        org.id,
        project.id,
        user.id,
        {
          title: 'my work item 2',
          description: 'my work item description 2',
          priority: Priority.MEDIUM,
          type: WorkItemType.TECHNICAL_DEBT,
          estimation: 13,
          feature: feature2.id,
          status: WorkItemStatus.IN_PROGRESS,
        },
      );
      await service.updateWorkItem(org.id, project.id, workItem1.id, {
        title: 'my work item 1',
        description: 'my work item description 1',
        priority: Priority.HIGH,
        type: WorkItemType.USER_STORY,
        estimation: 13,
        status: WorkItemStatus.DONE,
        feature: feature2.id,
      });
      await service.updateWorkItem(org.id, project.id, workItem2.id, {
        title: 'my work item 2',
        description: 'my work item description 2',
        priority: Priority.MEDIUM,
        type: WorkItemType.TECHNICAL_DEBT,
        estimation: 13,
        status: WorkItemStatus.IN_PROGRESS,
        feature: feature2.id,
      });
      const foundFeature1 = await featuresService.getFeature(
        org.id,
        project.id,
        feature1.id,
      );
      expect(foundFeature1.progress).toEqual(0);
      expect(foundFeature1.workItemsCount).toEqual(0);
      const foundFeature2 = await featuresService.getFeature(
        org.id,
        project.id,
        feature2.id,
      );
      expect(foundFeature2.progress).toEqual(50);
      expect(foundFeature2.workItemsCount).toEqual(2);
    });
  });
  describe('when deleting a work item with a feature', () => {
    it('should update the feature progress', async () => {
      const feature = await featuresService.createFeature(
        org.id,
        project.id,
        user.id,
        {
          title: 'my feature',
          description: 'my feature description',
          priority: Priority.HIGH,
          status: FeatureStatus.IN_PROGRESS,
        },
      );
      const workItem1 = await service.createWorkItem(
        org.id,
        project.id,
        user.id,
        {
          title: 'my work item',
          description: 'my work item description',
          priority: Priority.HIGH,
          type: WorkItemType.USER_STORY,
          estimation: 13,
          feature: feature.id,
          status: WorkItemStatus.DONE,
        },
      );
      const workItem2 = await service.createWorkItem(
        org.id,
        project.id,
        user.id,
        {
          title: 'my other work item',
          description: 'my other work item description',
          priority: Priority.MEDIUM,
          type: WorkItemType.TECHNICAL_DEBT,
          estimation: 13,
          feature: feature.id,
          status: WorkItemStatus.IN_PROGRESS,
        },
      );
      await service.deleteWorkItem(org.id, project.id, workItem1.id);
      await service.deleteWorkItem(org.id, project.id, workItem2.id);
      const foundFeature = await featuresService.getFeature(
        org.id,
        project.id,
        feature.id,
      );
      expect(foundFeature.progress).toEqual(0);
    });
    it('should update the feature workItemsCount', async () => {
      const feature = await featuresService.createFeature(
        org.id,
        project.id,
        user.id,
        {
          title: 'my feature',
          description: 'my feature description',
          priority: Priority.HIGH,
          status: FeatureStatus.IN_PROGRESS,
        },
      );
      const workItem1 = await service.createWorkItem(
        org.id,
        project.id,
        user.id,
        {
          title: 'my work item',
          description: 'my work item description',
          priority: Priority.HIGH,
          type: WorkItemType.USER_STORY,
          estimation: 13,
          feature: feature.id,
          status: WorkItemStatus.DONE,
        },
      );
      const workItem2 = await service.createWorkItem(
        org.id,
        project.id,
        user.id,
        {
          title: 'my other work item',
          description: 'my other work item description',
          priority: Priority.MEDIUM,
          type: WorkItemType.TECHNICAL_DEBT,
          estimation: 13,
          feature: feature.id,
          status: WorkItemStatus.IN_PROGRESS,
        },
      );
      await service.deleteWorkItem(org.id, project.id, workItem1.id);
      await service.deleteWorkItem(org.id, project.id, workItem2.id);
      const foundFeature = await featuresService.getFeature(
        org.id,
        project.id,
        feature.id,
      );
      expect(foundFeature.workItemsCount).toEqual(0);
    });
  });
  describe('when closing a work item', () => {
    it('should update the feature progress', async () => {
      const feature = await featuresService.createFeature(
        org.id,
        project.id,
        user.id,
        {
          title: 'my feature',
          description: 'my feature description',
          priority: Priority.MEDIUM,
          status: FeatureStatus.IN_PROGRESS,
        },
      );
      await service.createWorkItem(org.id, project.id, user.id, {
        title: 'my work item 1',
        description: 'my work item description 1',
        priority: Priority.HIGH,
        type: WorkItemType.USER_STORY,
        estimation: 13,
        feature: feature.id,
        status: WorkItemStatus.DONE,
      });
      const workItem2 = await service.createWorkItem(
        org.id,
        project.id,
        user.id,
        {
          title: 'my work item 2',
          description: 'my work item description 2',
          priority: Priority.MEDIUM,
          type: WorkItemType.TECHNICAL_DEBT,
          estimation: 13,
          feature: feature.id,
          status: WorkItemStatus.IN_PROGRESS,
        },
      );
      await service.updateWorkItem(org.id, project.id, workItem2.id, {
        title: 'my work item 2',
        description: 'my work item description 2',
        priority: Priority.MEDIUM,
        type: WorkItemType.TECHNICAL_DEBT,
        estimation: 13,
        feature: feature.id,
        status: WorkItemStatus.CLOSED,
      });
      const foundFeature = await featuresService.getFeature(
        org.id,
        project.id,
        feature.id,
      );
      expect(foundFeature.progress).toEqual(100);
    });
  });
  describe('when patching a work item', () => {
    it('should allow to patch the iteration', async () => {
      await iterationService.create(org.id, project.id, {
        goal: 'my iteration description',
        startDate: '2020-01-01',
        duration: 7,
      });
      const iteration2 = await iterationService.create(org.id, project.id, {
        goal: 'my iteration description',
        startDate: '2020-01-01',
        duration: 7,
      });
      const workItem = await service.createWorkItem(
        org.id,
        project.id,
        user.id,
        {
          title: 'my work item 1',
          description: 'my work item description 1',
          priority: Priority.HIGH,
          type: WorkItemType.USER_STORY,
          estimation: 13,
          status: WorkItemStatus.DONE,
        },
      );
      await service.patchWorkItem(org.id, project.id, workItem.id, {
        iteration: iteration2.id,
      });
      const foundWorkItem = await service.getWorkItem(
        org.id,
        project.id,
        workItem.id,
      );
      expect(foundWorkItem.iteration.id).toEqual(iteration2.id);
    });
    it('should allow to patch the status', async () => {
      const workItem = await service.createWorkItem(
        org.id,
        project.id,
        user.id,
        {
          title: 'my work item 1',
          description: 'my work item description 1',
          priority: Priority.HIGH,
          type: WorkItemType.USER_STORY,
          estimation: 13,
          status: WorkItemStatus.DONE,
        },
      );
      await service.patchWorkItem(org.id, project.id, workItem.id, {
        status: WorkItemStatus.IN_PROGRESS,
      });
      const foundWorkItem = await service.getWorkItem(
        org.id,
        project.id,
        workItem.id,
      );
      expect(foundWorkItem.status).toEqual(WorkItemStatus.IN_PROGRESS);
    });
    it('should update the feature progress when changing the status to DONE', async () => {
      const feature = await featuresService.createFeature(
        org.id,
        project.id,
        user.id,
        {
          title: 'my feature',
          description: 'my feature description',
          status: FeatureStatus.IN_PROGRESS,
          priority: Priority.LOW,
        },
      );
      const workItem = await service.createWorkItem(
        org.id,
        project.id,
        user.id,
        {
          title: 'my work item 1',
          description: 'my work item description 1',
          priority: Priority.HIGH,
          type: WorkItemType.USER_STORY,
          estimation: 13,
          feature: feature.id,
          status: WorkItemStatus.IN_PROGRESS,
        },
      );
      await service.patchWorkItem(org.id, project.id, workItem.id, {
        status: WorkItemStatus.DONE,
      });
      const foundFeature = await featuresService.getFeature(
        org.id,
        project.id,
        feature.id,
      );
      expect(foundFeature.progress).toEqual(100);
    });
    it('should update the feature progress when changing the status to CLOSED', async () => {
      const feature = await featuresService.createFeature(
        org.id,
        project.id,
        user.id,
        {
          title: 'my feature',
          description: 'my feature description',
          status: FeatureStatus.IN_PROGRESS,
          priority: Priority.LOW,
        },
      );
      const workItem = await service.createWorkItem(
        org.id,
        project.id,
        user.id,
        {
          title: 'my work item 1',
          description: 'my work item description 1',
          priority: Priority.HIGH,
          type: WorkItemType.USER_STORY,
          estimation: 13,
          feature: feature.id,
          status: WorkItemStatus.IN_PROGRESS,
        },
      );
      await service.patchWorkItem(org.id, project.id, workItem.id, {
        status: WorkItemStatus.CLOSED,
      });
      const foundFeature = await featuresService.getFeature(
        org.id,
        project.id,
        feature.id,
      );
      expect(foundFeature.progress).toEqual(100);
    });
    it('should update the feature progress when changing the status to IN_PROGRESS', async () => {
      const feature = await featuresService.createFeature(
        org.id,
        project.id,
        user.id,
        {
          title: 'my feature',
          description: 'my feature description',
          status: FeatureStatus.IN_PROGRESS,
          priority: Priority.LOW,
        },
      );
      const workItem = await service.createWorkItem(
        org.id,
        project.id,
        user.id,
        {
          title: 'my work item 1',
          description: 'my work item description 1',
          priority: Priority.HIGH,
          type: WorkItemType.USER_STORY,
          estimation: 13,
          feature: feature.id,
          status: WorkItemStatus.DONE,
        },
      );
      await service.patchWorkItem(org.id, project.id, workItem.id, {
        status: WorkItemStatus.IN_PROGRESS,
      });
      const foundFeature = await featuresService.getFeature(
        org.id,
        project.id,
        feature.id,
      );
      expect(foundFeature.progress).toEqual(0);
    });
    it('should update the work item priority', async () => {
      const workItem = await service.createWorkItem(
        org.id,
        project.id,
        user.id,
        {
          title: 'my work item 1',
          description: 'my work item description 1',
          priority: Priority.HIGH,
          type: WorkItemType.USER_STORY,
          estimation: 13,
          status: WorkItemStatus.DONE,
        },
      );
      await service.patchWorkItem(org.id, project.id, workItem.id, {
        priority: Priority.LOW,
      });
      const foundWorkItem = await service.getWorkItem(
        org.id,
        project.id,
        workItem.id,
      );
      expect(foundWorkItem.priority).toEqual(Priority.LOW);
    });
  });
  describe('when searching work items', () => {
    it('should return the work items that match the search query', async () => {
      const feature1 = await featuresService.createFeature(
        org.id,
        project.id,
        user.id,
        {
          title: 'my feature',
          description: 'my feature description',
          priority: Priority.HIGH,
          status: FeatureStatus.PLANNED,
        },
      );
      const feature2 = await featuresService.createFeature(
        org.id,
        project.id,
        user.id,
        {
          title: 'my other feature',
          description: 'my other feature description',
          priority: Priority.MEDIUM,
          status: FeatureStatus.PLANNED,
        },
      );
      await service.createWorkItem(org.id, project.id, user.id, {
        title: 'my work item',
        description: 'my work item description',
        priority: Priority.HIGH,
        type: WorkItemType.USER_STORY,
        feature: feature1.id,
        status: WorkItemStatus.PLANNED,
      });
      await service.createWorkItem(org.id, project.id, user.id, {
        title: 'my other work item',
        description: 'my other work item description',
        priority: Priority.MEDIUM,
        type: WorkItemType.TECHNICAL_DEBT,
        feature: feature2.id,
        status: WorkItemStatus.PLANNED,
      });
      const workItems = await service.searchWorkItems(
        org.id,
        project.id,
        'my work',
      );
      expect(workItems).toBeDefined();
      expect(workItems.length).toEqual(1);
      expect(workItems[0].title).toEqual('my work item');
      expect(workItems[0].description).toEqual('my work item description');
      expect(workItems[0].priority).toEqual(Priority.HIGH);
      expect(workItems[0].type).toEqual(WorkItemType.USER_STORY);
    });
    it('should return the work items that match the search query for the reference', async () => {
      const feature1 = await featuresService.createFeature(
        org.id,
        project.id,
        user.id,
        {
          title: 'my feature',
          description: 'my feature description',
          priority: Priority.HIGH,
          status: FeatureStatus.PLANNED,
        },
      );
      const feature2 = await featuresService.createFeature(
        org.id,
        project.id,
        user.id,
        {
          title: 'my other feature',
          description: 'my other feature description',
          priority: Priority.MEDIUM,
          status: FeatureStatus.PLANNED,
        },
      );
      const workItem = await service.createWorkItem(
        org.id,
        project.id,
        user.id,
        {
          title: 'my work item',
          description: 'my work item description',
          priority: Priority.HIGH,
          type: WorkItemType.USER_STORY,
          feature: feature1.id,
          status: WorkItemStatus.PLANNED,
        },
      );
      await service.createWorkItem(org.id, project.id, user.id, {
        title: 'my other work item',
        description: 'my other work item description',
        priority: Priority.MEDIUM,
        type: WorkItemType.TECHNICAL_DEBT,
        feature: feature2.id,
        status: WorkItemStatus.PLANNED,
      });
      const workItems = await service.searchWorkItems(
        org.id,
        project.id,
        workItem.reference,
      );
      expect(workItems).toBeDefined();
      expect(workItems.length).toEqual(1);
      expect(workItems[0].title).toEqual('my work item');
      expect(workItems[0].description).toEqual('my work item description');
      expect(workItems[0].priority).toEqual(Priority.HIGH);
      expect(workItems[0].type).toEqual(WorkItemType.USER_STORY);
    });
  });

  describe('when creating a work item comment', () => {
    it('should create the work item comment', async () => {
      const { org, user, project } = await getTestPremiumOrgAndUser();

      const workItem = await service.createWorkItem(
        org.id,
        project.id,
        user.id,
        {
          title: 'Test title',
          description: 'A test description',
          priority: Priority.HIGH,
          type: WorkItemType.BUG,
          status: WorkItemStatus.PLANNED,
        },
      );

      const comment = await service.createWorkItemComment(
        user.id,
        org.id,
        project.id,
        workItem.id,
        {
          content: 'my comment',
        },
      );
      expect(comment).toBeDefined();
      expect(comment.content).toEqual('my comment');
      expect(comment.createdBy.id).toEqual(user.id);
      expect(comment.createdBy.name).toEqual(user.name);
    });
    it('should throw an error if the org is not premium', async () => {
      const workItem = await service.createWorkItem(
        org.id,
        project.id,
        user.id,
        {
          title: 'Test title',
          description: 'A test description',
          priority: Priority.HIGH,
          type: WorkItemType.BUG,
          status: WorkItemStatus.PLANNED,
        },
      );

      await expect(
        service.createWorkItemComment(
          user.id,
          org.id,
          project.id,
          workItem.id,
          {
            content: 'my comment',
          },
        ),
      ).rejects.toThrowError('You need to upgrade to premium to add comments');
    });
    it('should throw an error if the comment content is empty', async () => {
      const { org, user, project } = await getTestPremiumOrgAndUser();

      const workItem = await service.createWorkItem(
        org.id,
        project.id,
        user.id,
        {
          title: 'Test title',
          description: 'A test description',
          priority: Priority.HIGH,
          type: WorkItemType.BUG,
          status: WorkItemStatus.PLANNED,
        },
      );

      await expect(
        service.createWorkItemComment(
          user.id,
          org.id,
          project.id,
          workItem.id,
          {
            content: '',
          },
        ),
      ).rejects.toThrowError('Comment content is required');
    });
  });

  describe('when listing the comments of a work item', () => {
    it('should return the list of comments of the work item', async () => {
      const { org, user, project } = await getTestPremiumOrgAndUser();

      const workItem = new WorkItem();
      workItem.title = 'my work item';
      workItem.description = 'my work item description';
      workItem.priority = Priority.HIGH;
      workItem.type = WorkItemType.USER_STORY;
      workItem.status = WorkItemStatus.PLANNED;
      workItem.org = Promise.resolve(org);
      workItem.createdBy = Promise.resolve(user);
      workItem.project = Promise.resolve(project);
      const savedWorkItem = await workItemsRepository.save(workItem);

      const comment1 = new WorkItemComment();
      comment1.content = 'my comment 1';
      comment1.createdBy = Promise.resolve(user);
      comment1.workItem = Promise.resolve(savedWorkItem);
      comment1.org = Promise.resolve(org);
      await workItemCommentsRepository.save(comment1);

      const comment2 = new WorkItemComment();
      comment2.content = 'my comment 2';
      comment2.createdBy = Promise.resolve(user);
      comment2.workItem = Promise.resolve(savedWorkItem);
      comment2.org = Promise.resolve(org);
      await workItemCommentsRepository.save(comment2);

      const comments = await service.listWorkItemComments(
        org.id,
        project.id,
        workItem.id,
      );
      expect(comments).toBeDefined();
      expect(comments.length).toEqual(2);
      expect(comments[0].content).toEqual('my comment 1');
      expect(comments[1].content).toEqual('my comment 2');
    });
  });
  describe('when deleting a work item comment', () => {
    it('should delete the work item comment', async () => {
      const { org, user, project } = await getTestPremiumOrgAndUser();

      const workItem = new WorkItem();
      workItem.title = 'my work item';
      workItem.description = 'my work item description';
      workItem.priority = Priority.HIGH;
      workItem.type = WorkItemType.USER_STORY;
      workItem.status = WorkItemStatus.PLANNED;
      workItem.org = Promise.resolve(org);
      workItem.createdBy = Promise.resolve(user);
      workItem.project = Promise.resolve(project);
      const savedWorkItem = await workItemsRepository.save(workItem);

      const comment = new WorkItemComment();
      comment.content = 'my comment';
      comment.createdBy = Promise.resolve(user);
      comment.workItem = Promise.resolve(savedWorkItem);
      comment.org = Promise.resolve(org);
      const savedComment = await workItemCommentsRepository.save(comment);

      await service.deleteWorkItemComment(
        user.id,
        workItem.id,
        savedComment.id,
      );

      await expect(
        workItemCommentsRepository.findOneByOrFail({ id: savedComment.id }),
      ).rejects.toThrow(EntityNotFoundError);
    });
  });
  describe('when updating a work item comment', () => {
    it('should update the work item comment', async () => {
      const { org, user, project } = await getTestPremiumOrgAndUser();

      const workItem = new WorkItem();
      workItem.title = 'my work item';
      workItem.description = 'my work item description';
      workItem.priority = Priority.HIGH;
      workItem.type = WorkItemType.USER_STORY;
      workItem.status = WorkItemStatus.PLANNED;
      workItem.org = Promise.resolve(org);
      workItem.createdBy = Promise.resolve(user);
      workItem.project = Promise.resolve(project);
      const savedWorkItem = await workItemsRepository.save(workItem);

      const comment = new WorkItemComment();
      comment.content = 'my comment';
      comment.createdBy = Promise.resolve(user);
      comment.workItem = Promise.resolve(savedWorkItem);
      comment.org = Promise.resolve(org);
      const savedComment = await workItemCommentsRepository.save(comment);

      const updatedComment = await service.updateWorkItemComment(
        user.id,
        workItem.id,
        savedComment.id,
        {
          content: 'my updated comment',
        },
      );
      expect(updatedComment).toBeDefined();
      expect(updatedComment.content).toEqual('my updated comment');
    });
    it('should throw an error if the comment is empty', async () => {
      const { org, user, project } = await getTestPremiumOrgAndUser();

      const workItem = new WorkItem();
      workItem.title = 'my work item';
      workItem.description = 'my work item description';
      workItem.priority = Priority.HIGH;
      workItem.type = WorkItemType.USER_STORY;
      workItem.status = WorkItemStatus.PLANNED;
      workItem.org = Promise.resolve(org);
      workItem.createdBy = Promise.resolve(user);
      workItem.project = Promise.resolve(project);
      const savedWorkItem = await workItemsRepository.save(workItem);

      const comment = new WorkItemComment();
      comment.content = 'my comment';
      comment.createdBy = Promise.resolve(user);
      comment.workItem = Promise.resolve(savedWorkItem);
      comment.org = Promise.resolve(org);
      const savedComment = await workItemCommentsRepository.save(comment);

      await expect(
        service.updateWorkItemComment(user.id, workItem.id, savedComment.id, {
          content: '',
        }),
      ).rejects.toThrowError('Comment content is required');
    });
  });
});
