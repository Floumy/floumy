import { WorkItemsController } from './work-items.controller';
import { Org } from '../../orgs/org.entity';
import { setupTestingModule } from '../../../test/test.utils';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Feature } from '../../roadmap/features/feature.entity';
import { UsersModule } from '../../users/users.module';
import { OrgsService } from '../../orgs/orgs.service';
import { TokensService } from '../../auth/tokens.service';
import { FeaturesService } from '../../roadmap/features/features.service';
import { UsersService } from '../../users/users.service';
import { WorkItem } from './work-item.entity';
import { Priority } from '../../common/priority.enum';
import { WorkItemType } from './work-item-type.enum';
import { Objective } from '../../okrs/objective.entity';
import { KeyResult } from '../../okrs/key-result.entity';
import { OkrsService } from '../../okrs/okrs.service';
import { Milestone } from '../../roadmap/milestones/milestone.entity';
import { MilestonesService } from '../../roadmap/milestones/milestones.service';
import { WorkItemsService } from './work-items.service';
import { WorkItemStatus } from './work-item-status.enum';
import { FeatureStatus } from '../../roadmap/features/featurestatus.enum';
import { Iteration } from '../../iterations/Iteration.entity';
import { IterationsService } from '../../iterations/iterations.service';
import { File } from '../../files/file.entity';
import { Repository } from 'typeorm';
import { WorkItemFile } from './work-item-file.entity';
import { FeatureFile } from '../../roadmap/features/feature-file.entity';
import { User } from '../../users/user.entity';
import { FilesService } from '../../files/files.service';
import { FilesStorageRepository } from '../../files/files-storage.repository';
import { PaymentPlan } from '../../auth/payment.plan';
import { uuid } from 'uuidv4';
import { Project } from '../../projects/project.entity';

describe('WorkItemsController', () => {
  let org: Org;
  let user: User;
  let project: Project;
  let controller: WorkItemsController;
  let cleanup: () => Promise<void>;
  let featureService: FeaturesService;
  let iterationsService: IterationsService;
  let fileRepository: Repository<File>;
  let orgsRepository: Repository<Org>;
  let usersRepository: Repository<User>;
  let projectsRepository: Repository<Project>;

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
      [WorkItemsController],
    );
    cleanup = dbCleanup;
    controller = module.get<WorkItemsController>(WorkItemsController);
    const orgsService = module.get<OrgsService>(OrgsService);
    const usersService = module.get<UsersService>(UsersService);
    user = await usersService.createUserWithOrg(
      'Test User',
      'test@example.com',
      'testtesttest',
    );
    org = await orgsService.createForUser(user);
    project = (await org.projects)[0];
    featureService = module.get<FeaturesService>(FeaturesService);
    iterationsService = module.get<IterationsService>(IterationsService);
    fileRepository = module.get<Repository<File>>(getRepositoryToken(File));
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
    project.org = Promise.resolve(premiumOrg);
    await projectsRepository.save(project);

    return { org, user, project };
  }

  describe('when creating a work item', () => {
    it('should return the created work item', async () => {
      const feature = await featureService.createFeature(
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
      const workItemResponse = await controller.create(
        org.id,
        project.id,
        {
          user: {
            sub: user.id,
            org: org.id,
          },
        },
        {
          title: 'my work item',
          description: 'my work item description',
          priority: Priority.HIGH,
          type: WorkItemType.TECHNICAL_DEBT,
          feature: feature.id,
          status: WorkItemStatus.PLANNED,
        },
      );

      expect(workItemResponse.id).toBeDefined();
      expect(workItemResponse.title).toEqual('my work item');
      expect(workItemResponse.description).toEqual('my work item description');
      expect(workItemResponse.priority).toEqual('high');
      expect(workItemResponse.type).toEqual('technical-debt');
      expect(workItemResponse.createdAt).toBeDefined();
      expect(workItemResponse.updatedAt).toBeDefined();
      expect(workItemResponse.status).toEqual('planned');
      expect(workItemResponse.feature).toBeDefined();
      expect(workItemResponse.feature.id).toEqual(feature.id);
      expect(workItemResponse.feature.title).toEqual(feature.title);
    });
    it('should create a work item with files', async () => {
      const file1Entity = new File();
      file1Entity.name = 'file1';
      file1Entity.path = 'path1';
      file1Entity.type = 'image/png';
      file1Entity.size = 100;
      file1Entity.url = 'url1';
      file1Entity.org = Promise.resolve(org);
      file1Entity.project = Promise.resolve(project);
      const file2Entity = new File();
      file2Entity.name = 'file2';
      file2Entity.path = 'path2';
      file2Entity.type = 'image/png';
      file2Entity.size = 100;
      file2Entity.url = 'url2';
      file2Entity.org = Promise.resolve(org);
      file2Entity.project = Promise.resolve(project);
      const file1 = await fileRepository.save(file1Entity);
      const file2 = await fileRepository.save(file2Entity);
      const workItemResponse = await controller.create(
        org.id,
        project.id,
        {
          user: {
            sub: user.id,
            org: org.id,
          },
        },
        {
          title: 'my work item',
          description: 'my work item description',
          priority: Priority.HIGH,
          type: WorkItemType.TECHNICAL_DEBT,
          status: WorkItemStatus.PLANNED,
          files: [
            {
              id: file1.id,
            },
            {
              id: file2.id,
            },
          ],
        },
      );

      expect(workItemResponse.id).toBeDefined();
      expect(workItemResponse.title).toEqual('my work item');
      expect(workItemResponse.description).toEqual('my work item description');
      expect(workItemResponse.priority).toEqual('high');
      expect(workItemResponse.type).toEqual('technical-debt');
      expect(workItemResponse.createdAt).toBeDefined();
      expect(workItemResponse.updatedAt).toBeDefined();
      expect(workItemResponse.status).toEqual('planned');
      expect(workItemResponse.files).toBeDefined();
      expect(workItemResponse.files.length).toEqual(2);
      expect(workItemResponse.files[0].id).toEqual(file1.id);
      expect(workItemResponse.files[1].id).toEqual(file2.id);
    });
  });
  describe('when listing work items', () => {
    it('should return the list of work items', async () => {
      const feature = await featureService.createFeature(
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
      await controller.create(
        org.id,
        project.id,
        {
          user: {
            sub: user.id,
            org: org.id,
          },
        },
        {
          title: 'my work item',
          description: 'my work item description',
          priority: Priority.HIGH,
          type: WorkItemType.TECHNICAL_DEBT,
          feature: feature.id,
          status: WorkItemStatus.PLANNED,
        },
      );
      const workItems = await controller.list(org.id, project.id, {
        user: {
          org: org.id,
        },
      });

      expect(workItems.length).toEqual(1);
      expect(workItems[0].id).toBeDefined();
      expect(workItems[0].title).toEqual('my work item');
      expect(workItems[0].description).toEqual('my work item description');
      expect(workItems[0].priority).toEqual('high');
      expect(workItems[0].type).toEqual('technical-debt');
      expect(workItems[0].createdAt).toBeDefined();
      expect(workItems[0].updatedAt).toBeDefined();
      expect(workItems[0].status).toEqual('planned');
    });
  });
  describe('when getting a work item', () => {
    it('should return the work item', async () => {
      const feature = await featureService.createFeature(
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
      const workItem = await controller.create(
        org.id,
        project.id,
        {
          user: {
            sub: user.id,
            org: org.id,
          },
        },
        {
          title: 'my work item',
          description: 'my work item description',
          priority: Priority.HIGH,
          type: WorkItemType.TECHNICAL_DEBT,
          feature: feature.id,
          status: WorkItemStatus.PLANNED,
        },
      );
      const workItemResponse = await controller.get(
        org.id,
        project.id,
        {
          user: {
            org: org.id,
          },
        },
        workItem.id,
      );

      expect(workItemResponse.id).toBeDefined();
      expect(workItemResponse.title).toEqual('my work item');
      expect(workItemResponse.description).toEqual('my work item description');
      expect(workItemResponse.priority).toEqual('high');
      expect(workItemResponse.type).toEqual('technical-debt');
      expect(workItemResponse.createdAt).toBeDefined();
      expect(workItemResponse.updatedAt).toBeDefined();
      expect(workItemResponse.status).toEqual('planned');
      expect(workItemResponse.feature).toBeDefined();
      expect(workItemResponse.feature.id).toEqual(feature.id);
      expect(workItemResponse.feature.title).toEqual(feature.title);
    });
  });
  describe('when updating a work item', () => {
    it('should return the updated work item', async () => {
      const feature = await featureService.createFeature(
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
      const workItem = await controller.create(
        org.id,
        project.id,
        {
          user: {
            sub: user.id,
            org: org.id,
          },
        },
        {
          title: 'my work item',
          description: 'my work item description',
          priority: Priority.HIGH,
          type: WorkItemType.TECHNICAL_DEBT,
          feature: feature.id,
          status: WorkItemStatus.PLANNED,
        },
      );
      const workItemResponse = await controller.update(
        org.id,
        project.id,
        {
          user: {
            org: org.id,
          },
        },
        workItem.id,
        {
          title: 'my work item updated',
          description: 'my work item description updated',
          priority: Priority.LOW,
          type: WorkItemType.BUG,
          feature: feature.id,
          status: WorkItemStatus.PLANNED,
        },
      );

      expect(workItemResponse.id).toBeDefined();
      expect(workItemResponse.title).toEqual('my work item updated');
      expect(workItemResponse.description).toEqual(
        'my work item description updated',
      );
      expect(workItemResponse.priority).toEqual('low');
      expect(workItemResponse.type).toEqual('bug');
      expect(workItemResponse.createdAt).toBeDefined();
      expect(workItemResponse.updatedAt).toBeDefined();
      expect(workItemResponse.status).toEqual('planned');
      expect(workItemResponse.feature).toBeDefined();
      expect(workItemResponse.feature.id).toEqual(feature.id);
      expect(workItemResponse.feature.title).toEqual(feature.title);
    });
    it('should update the work item with files', async () => {
      const file1Entity = new File();
      file1Entity.name = 'file1';
      file1Entity.path = 'path1';
      file1Entity.type = 'image/png';
      file1Entity.size = 100;
      file1Entity.url = 'url1';
      file1Entity.org = Promise.resolve(org);
      file1Entity.project = Promise.resolve(project);
      const file2Entity = new File();
      file2Entity.name = 'file2';
      file2Entity.path = 'path2';
      file2Entity.type = 'image/png';
      file2Entity.size = 100;
      file2Entity.url = 'url2';
      file2Entity.org = Promise.resolve(org);
      file2Entity.project = Promise.resolve(project);
      const file1 = await fileRepository.save(file1Entity);
      const file2 = await fileRepository.save(file2Entity);
      const feature = await featureService.createFeature(
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
      const workItem = await controller.create(
        org.id,
        project.id,
        {
          user: {
            sub: user.id,
            org: org.id,
          },
        },
        {
          title: 'my work item',
          description: 'my work item description',
          priority: Priority.HIGH,
          type: WorkItemType.TECHNICAL_DEBT,
          feature: feature.id,
          status: WorkItemStatus.PLANNED,
        },
      );
      const workItemResponse = await controller.update(
        org.id,
        project.id,
        {
          user: {
            org: org.id,
          },
        },
        workItem.id,
        {
          title: 'my work item updated',
          description: 'my work item description updated',
          priority: Priority.LOW,
          type: WorkItemType.BUG,
          status: WorkItemStatus.PLANNED,
          files: [
            {
              id: file1.id,
            },
            {
              id: file2.id,
            },
          ],
        },
      );

      expect(workItemResponse.id).toBeDefined();
      expect(workItemResponse.title).toEqual('my work item updated');
      expect(workItemResponse.description).toEqual(
        'my work item description updated',
      );
      expect(workItemResponse.priority).toEqual('low');
      expect(workItemResponse.type).toEqual('bug');
      expect(workItemResponse.createdAt).toBeDefined();
      expect(workItemResponse.updatedAt).toBeDefined();
      expect(workItemResponse.status).toEqual('planned');
      expect(workItemResponse.files).toBeDefined();
    });
  });
  describe('when deleting a work item', () => {
    it('should delete the work item', async () => {
      const feature = await featureService.createFeature(
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
      const workItem = await controller.create(
        org.id,
        project.id,
        {
          user: {
            sub: user.id,
            org: org.id,
          },
        },
        {
          title: 'my work item',
          description: 'my work item description',
          priority: Priority.HIGH,
          type: WorkItemType.TECHNICAL_DEBT,
          feature: feature.id,
          status: WorkItemStatus.PLANNED,
        },
      );
      await controller.delete(
        org.id,
        project.id,
        {
          user: {
            org: org.id,
          },
        },
        workItem.id,
      );
      const workItems = await controller.list(org.id, project.id, {
        user: {
          org: org.id,
        },
      });

      expect(workItems.length).toEqual(0);
    });
  });
  describe('when getting open work items', () => {
    it('should return the open work items', async () => {
      const feature = await featureService.createFeature(
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
      await controller.create(
        org.id,
        project.id,
        {
          user: {
            sub: user.id,
            org: org.id,
          },
        },
        {
          title: 'my work item',
          description: 'my work item description',
          priority: Priority.HIGH,
          type: WorkItemType.TECHNICAL_DEBT,
          feature: feature.id,
          status: WorkItemStatus.PLANNED,
        },
      );
      const workItems = await controller.listOpenWithoutIterations(
        org.id,
        project.id,
        {
          user: {
            org: org.id,
          },
        },
      );

      expect(workItems.length).toEqual(1);
      expect(workItems[0].id).toBeDefined();
      expect(workItems[0].title).toEqual('my work item');
      expect(workItems[0].description).toEqual('my work item description');
      expect(workItems[0].priority).toEqual('high');
      expect(workItems[0].type).toEqual('technical-debt');
      expect(workItems[0].createdAt).toBeDefined();
      expect(workItems[0].updatedAt).toBeDefined();
      expect(workItems[0].status).toEqual('planned');
    });
  });
  describe('when patching a work item', () => {
    it('should update the iteration', async () => {
      const workItem = await controller.create(
        org.id,
        project.id,
        {
          user: {
            sub: user.id,
            org: org.id,
          },
        },
        {
          title: 'my work item',
          description: 'my work item description',
          priority: Priority.HIGH,
          type: WorkItemType.TECHNICAL_DEBT,
          status: WorkItemStatus.PLANNED,
        },
      );
      const iteration = await iterationsService.create(org.id, project.id, {
        goal: 'my iteration description',
        startDate: '2019-01-01',
        duration: 2,
      });
      const updatedWorkItem = await controller.patch(
        org.id,
        project.id,
        {
          user: {
            org: org.id,
          },
        },
        workItem.id,
        {
          iteration: iteration.id,
        },
      );
      expect(updatedWorkItem.id).toEqual(workItem.id);
      expect(updatedWorkItem.iteration.id).toEqual(iteration.id);
    });
    it('should update the status', async () => {
      const workItem = await controller.create(
        org.id,
        project.id,
        {
          user: {
            sub: user.id,
            org: org.id,
          },
        },
        {
          title: 'my work item',
          description: 'my work item description',
          priority: Priority.HIGH,
          type: WorkItemType.TECHNICAL_DEBT,
          status: WorkItemStatus.PLANNED,
        },
      );
      const updatedWorkItem = await controller.patch(
        org.id,
        project.id,
        {
          user: {
            org: org.id,
          },
        },
        workItem.id,
        {
          status: WorkItemStatus.IN_PROGRESS,
        },
      );
      expect(updatedWorkItem.id).toEqual(workItem.id);
      expect(updatedWorkItem.status).toEqual(WorkItemStatus.IN_PROGRESS);
    });
  });
  describe('when searching work items', () => {
    it('should return the work items', async () => {
      const feature = await featureService.createFeature(
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
      await controller.create(
        org.id,
        project.id,
        {
          user: {
            sub: user.id,
            org: org.id,
          },
        },
        {
          title: 'my work item',
          description: 'my work item description',
          priority: Priority.HIGH,
          type: WorkItemType.TECHNICAL_DEBT,
          feature: feature.id,
          status: WorkItemStatus.PLANNED,
        },
      );
      const workItems = await controller.search(
        org.id,
        project.id,
        {
          user: {
            org: org.id,
          },
        },
        'work',
      );

      expect(workItems.length).toEqual(1);
      expect(workItems[0].id).toBeDefined();
      expect(workItems[0].title).toEqual('my work item');
      expect(workItems[0].description).toEqual('my work item description');
      expect(workItems[0].priority).toEqual('high');
      expect(workItems[0].type).toEqual('technical-debt');
      expect(workItems[0].createdAt).toBeDefined();
      expect(workItems[0].updatedAt).toBeDefined();
      expect(workItems[0].status).toEqual('planned');
    });
  });
  describe('when adding a comment to a work item', () => {
    it('should return the comment', async () => {
      const {
        org: premiumOrg,
        user: premiumOrgUser,
        project,
      } = await getTestPremiumOrgAndUser();
      const workItem = await controller.create(
        premiumOrg.id,
        project.id,
        {
          user: {
            sub: premiumOrgUser.id,
            org: premiumOrg.id,
          },
        },
        {
          title: 'my work item',
          description: 'my work item description',
          priority: Priority.HIGH,
          type: WorkItemType.TECHNICAL_DEBT,
          status: WorkItemStatus.PLANNED,
        },
      );
      const comment = await controller.createComment(
        premiumOrg.id,
        project.id,
        {
          user: {
            sub: premiumOrgUser.id,
            org: premiumOrg.id,
          },
        },
        workItem.id,
        {
          content: 'my comment',
        },
      );

      expect(comment.id).toBeDefined();
      expect(comment.content).toEqual('my comment');
      expect(comment.createdBy.id).toEqual(premiumOrgUser.id);
      expect(comment.createdBy.name).toEqual(premiumOrgUser.name);
      expect(comment.createdAt).toBeDefined();
      expect(comment.updatedAt).toBeDefined();
    });
  });
  describe('when listing comments of a work item', () => {
    it('should return the comments', async () => {
      const {
        org: premiumOrg,
        user: premiumOrgUser,
        project,
      } = await getTestPremiumOrgAndUser();
      const workItem = await controller.create(
        premiumOrg.id,
        project.id,
        {
          user: {
            sub: premiumOrgUser.id,
            org: premiumOrg.id,
          },
        },
        {
          title: 'my work item',
          description: 'my work item description',
          priority: Priority.HIGH,
          type: WorkItemType.TECHNICAL_DEBT,
          status: WorkItemStatus.PLANNED,
        },
      );
      await controller.createComment(
        premiumOrg.id,
        project.id,
        {
          user: {
            sub: premiumOrgUser.id,
            org: premiumOrg.id,
          },
        },
        workItem.id,
        {
          content: 'my comment',
        },
      );
      const comments = await controller.listComments(
        premiumOrg.id,
        project.id,
        workItem.id,
      );

      expect(comments.length).toEqual(1);
      expect(comments[0].id).toBeDefined();
      expect(comments[0].content).toEqual('my comment');
      expect(comments[0].createdBy.id).toEqual(premiumOrgUser.id);
      expect(comments[0].createdBy.name).toEqual(premiumOrgUser.name);
      expect(comments[0].createdAt).toBeDefined();
      expect(comments[0].updatedAt).toBeDefined();
    });
  });
  describe('when deleting a work item comment', () => {
    it('should delete the comment', async () => {
      const {
        org: premiumOrg,
        user: premiumOrgUser,
        project,
      } = await getTestPremiumOrgAndUser();
      const workItem = await controller.create(
        premiumOrg.id,
        project.id,
        {
          user: {
            sub: premiumOrgUser.id,
            org: premiumOrg.id,
          },
        },
        {
          title: 'my work item',
          description: 'my work item description',
          priority: Priority.HIGH,
          type: WorkItemType.TECHNICAL_DEBT,
          status: WorkItemStatus.PLANNED,
        },
      );
      const comment = await controller.createComment(
        premiumOrg.id,
        project.id,
        {
          user: {
            sub: premiumOrgUser.id,
            org: premiumOrg.id,
          },
        },
        workItem.id,
        {
          content: 'my comment',
        },
      );
      await controller.deleteComment(
        {
          user: {
            sub: premiumOrgUser.id,
          },
        },
        workItem.id,
        comment.id,
      );
      const comments = await controller.listComments(
        premiumOrg.id,
        project.id,
        workItem.id,
      );

      expect(comments.length).toEqual(0);
    });
    it('should throw an error if another user tries to delete it', async () => {
      const {
        org: premiumOrg,
        user: premiumOrgUser,
        project,
      } = await getTestPremiumOrgAndUser();
      const workItem = await controller.create(
        premiumOrg.id,
        project.id,
        {
          user: {
            sub: premiumOrgUser.id,
            org: premiumOrg.id,
          },
        },
        {
          title: 'my work item',
          description: 'my work item description',
          priority: Priority.HIGH,
          type: WorkItemType.TECHNICAL_DEBT,
          status: WorkItemStatus.PLANNED,
        },
      );
      const comment = await controller.createComment(
        premiumOrg.id,
        project.id,
        {
          user: {
            sub: premiumOrgUser.id,
            org: premiumOrg.id,
          },
        },
        workItem.id,
        {
          content: 'my comment',
        },
      );

      await expect(
        controller.deleteComment(
          {
            user: {
              sub: uuid(),
              org: org.id,
            },
          },
          workItem.id,
          comment.id,
        ),
      ).rejects.toThrow();
    });
  });
  describe('when updating a work item comment', () => {
    it('should update the comment', async () => {
      const {
        org: premiumOrg,
        user: premiumOrgUser,
        project,
      } = await getTestPremiumOrgAndUser();
      const workItem = await controller.create(
        premiumOrg.id,
        project.id,
        {
          user: {
            sub: premiumOrgUser.id,
            org: premiumOrg.id,
          },
        },
        {
          title: 'my work item',
          description: 'my work item description',
          priority: Priority.HIGH,
          type: WorkItemType.TECHNICAL_DEBT,
          status: WorkItemStatus.PLANNED,
        },
      );
      const comment = await controller.createComment(
        premiumOrg.id,
        project.id,
        {
          user: {
            sub: premiumOrgUser.id,
            org: premiumOrg.id,
          },
        },
        workItem.id,
        {
          content: 'my comment',
        },
      );
      const updatedComment = await controller.updateComment(
        {
          user: {
            sub: premiumOrgUser.id,
          },
        },
        workItem.id,
        comment.id,
        {
          content: 'my updated comment',
        },
      );

      expect(updatedComment.id).toEqual(comment.id);
      expect(updatedComment.content).toEqual('my updated comment');
      expect(updatedComment.createdBy.id).toEqual(premiumOrgUser.id);
      expect(updatedComment.createdBy.name).toEqual(premiumOrgUser.name);
      expect(updatedComment.createdAt).toBeDefined();
      expect(updatedComment.updatedAt).toBeDefined();
    });
  });
});
