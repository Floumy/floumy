import { WorkItemsController } from './work-items.controller';
import { Org } from '../../orgs/org.entity';
import { setupTestingModule } from '../../../test/test.utils';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Initiative } from '../../roadmap/initiatives/initiative.entity';
import { UsersModule } from '../../users/users.module';
import { OrgsService } from '../../orgs/orgs.service';
import { TokensService } from '../../auth/tokens.service';
import { InitiativesService } from '../../roadmap/initiatives/initiatives.service';
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
import { InitiativeStatus } from '../../roadmap/initiatives/initiativestatus.enum';
import { Sprint } from '../../sprints/sprint.entity';
import { SprintsService } from '../../sprints/sprints.service';
import { File } from '../../files/file.entity';
import { Repository } from 'typeorm';
import { WorkItemFile } from './work-item-file.entity';
import { InitiativeFile } from '../../roadmap/initiatives/initiative-file.entity';
import { User } from '../../users/user.entity';
import { FilesService } from '../../files/files.service';
import { FilesStorageRepository } from '../../files/files-storage.repository';
import { uuid } from 'uuidv4';
import { Project } from '../../projects/project.entity';

describe('WorkItemsController', () => {
  let org: Org;
  let user: User;
  let project: Project;
  let controller: WorkItemsController;
  let cleanup: () => Promise<void>;
  let featureService: InitiativesService;
  let sprintsService: SprintsService;
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
          Initiative,
          WorkItem,
          Milestone,
          Sprint,
          File,
          InitiativeFile,
          WorkItemFile,
        ]),
        UsersModule,
      ],
      [
        OkrsService,
        OrgsService,
        TokensService,
        InitiativesService,
        MilestonesService,
        WorkItemsService,
        SprintsService,
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
    featureService = module.get<InitiativesService>(InitiativesService);
    sprintsService = module.get<SprintsService>(SprintsService);
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
      const feature = await featureService.createInitiative(
        org.id,
        project.id,
        user.id,
        {
          title: 'my feature',
          description: 'my feature description',
          priority: Priority.HIGH,
          status: InitiativeStatus.PLANNED,
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
          initiative: feature.id,
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
      expect(workItemResponse.initiative).toBeDefined();
      expect(workItemResponse.initiative.id).toEqual(feature.id);
      expect(workItemResponse.initiative.title).toEqual(feature.title);
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
      const feature = await featureService.createInitiative(
        org.id,
        project.id,
        user.id,
        {
          title: 'my feature',
          description: 'my feature description',
          priority: Priority.HIGH,
          status: InitiativeStatus.PLANNED,
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
          initiative: feature.id,
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
      const feature = await featureService.createInitiative(
        org.id,
        project.id,
        user.id,
        {
          title: 'my feature',
          description: 'my feature description',
          priority: Priority.HIGH,
          status: InitiativeStatus.PLANNED,
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
          initiative: feature.id,
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
      expect(workItemResponse.initiative).toBeDefined();
      expect(workItemResponse.initiative.id).toEqual(feature.id);
      expect(workItemResponse.initiative.title).toEqual(feature.title);
    });
  });
  describe('when updating a work item', () => {
    it('should return the updated work item', async () => {
      const feature = await featureService.createInitiative(
        org.id,
        project.id,
        user.id,
        {
          title: 'my feature',
          description: 'my feature description',
          priority: Priority.HIGH,
          status: InitiativeStatus.PLANNED,
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
          initiative: feature.id,
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
          mentions: [user.id],
          priority: Priority.LOW,
          type: WorkItemType.BUG,
          initiative: feature.id,
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
      expect(workItemResponse.initiative).toBeDefined();
      expect(workItemResponse.initiative.id).toEqual(feature.id);
      expect(workItemResponse.initiative.title).toEqual(feature.title);
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
      const feature = await featureService.createInitiative(
        org.id,
        project.id,
        user.id,
        {
          title: 'my feature',
          description: 'my feature description',
          priority: Priority.HIGH,
          status: InitiativeStatus.PLANNED,
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
          initiative: feature.id,
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
          mentions: [user.id],
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
      const feature = await featureService.createInitiative(
        org.id,
        project.id,
        user.id,
        {
          title: 'my feature',
          description: 'my feature description',
          priority: Priority.HIGH,
          status: InitiativeStatus.PLANNED,
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
          initiative: feature.id,
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
      const feature = await featureService.createInitiative(
        org.id,
        project.id,
        user.id,
        {
          title: 'my feature',
          description: 'my feature description',
          priority: Priority.HIGH,
          status: InitiativeStatus.PLANNED,
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
          initiative: feature.id,
          status: WorkItemStatus.PLANNED,
        },
      );
      const workItems = await controller.listOpenWithoutSprints(
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
    it('should update the sprint', async () => {
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
      const sprint = await sprintsService.create(org.id, project.id, {
        goal: 'my sprint description',
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
          sprint: sprint.id,
        },
      );
      expect(updatedWorkItem.id).toEqual(workItem.id);
      expect(updatedWorkItem.sprint.id).toEqual(sprint.id);
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
      const feature = await featureService.createInitiative(
        org.id,
        project.id,
        user.id,
        {
          title: 'my feature',
          description: 'my feature description',
          priority: Priority.HIGH,
          status: InitiativeStatus.PLANNED,
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
          initiative: feature.id,
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
          mentions: [],
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

  describe('when adding a comment with a mention to a work item', () => {
    it('should return the comment', async () => {
      const {
        org: premiumOrg,
        user: premiumOrgUser,
        project,
      } = await getTestPremiumOrgAndUser();
      const secondUser = await usersRepository.save({
        name: 'Second User',
        email: 'second@example.com',
        password: 'testtesttest',
        org: Promise.resolve(premiumOrg),
      });

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
          mentions: [secondUser.id, premiumOrgUser.id],
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
          mentions: [],
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
          mentions: [],
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
          mentions: [],
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
          mentions: [],
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
          mentions: [],
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
  describe('when updating a work item comment with mentions', () => {
    it('should update the comment', async () => {
      const {
        org: premiumOrg,
        user: premiumOrgUser,
        project,
      } = await getTestPremiumOrgAndUser();
      const secondUser = await usersRepository.save({
        name: 'Second User',
        email: 'second@example.com',
        password: 'testtesttest',
        org: Promise.resolve(premiumOrg),
      });
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
          mentions: [secondUser.id, premiumOrgUser.id],
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
          mentions: [secondUser.id],
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
  describe('when updating a work item assignee', () => {
    it('should update the assignee', async () => {
      const {
        org: premiumOrg,
        user: premiumOrgUser,
        project,
      } = await getTestPremiumOrgAndUser();
      const secondUser = await usersRepository.save({
        name: 'Second User',
        email: 'second@example.com',
        password: 'testtesttest',
        org: Promise.resolve(premiumOrg),
      });
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
      await controller.changeAssignee(
        {
          user: {
            sub: premiumOrgUser.id,
            org: premiumOrg.id,
          },
        },
        premiumOrg.id,
        project.id,
        workItem.id,
        {
          assignee: secondUser.id,
        },
      );
      const updatedWorkItem = await controller.get(
        premiumOrg.id,
        project.id,
        {
          user: {
            org: premiumOrg.id,
          },
        },
        workItem.id,
      );
      expect(updatedWorkItem.assignedTo.id).toEqual(secondUser.id);
      await controller.changeAssignee(
        {
          user: {
            sub: premiumOrgUser.id,
            org: premiumOrg.id,
          },
        },
        premiumOrg.id,
        project.id,
        workItem.id,
        {
          assignee: '',
        },
      );
      const secondUpdatedWorkItem = await controller.get(
        premiumOrg.id,
        project.id,
        {
          user: {
            org: premiumOrg.id,
          },
        },
        workItem.id,
      );
      expect(secondUpdatedWorkItem.assignedTo).toBeUndefined();
    });
  });
});
