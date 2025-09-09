import { WorkItemsService } from './work-items.service';
import { UsersService } from '../../users/users.service';
import { InitiativesService } from '../../roadmap/initiatives/initiatives.service';
import { MilestonesService } from '../../roadmap/milestones/milestones.service';
import { OkrsService } from '../../okrs/okrs.service';
import { OrgsService } from '../../orgs/orgs.service';
import { Org } from '../../orgs/org.entity';
import { setupTestingModule } from '../../../test/test.utils';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Objective } from '../../okrs/objective.entity';
import { KeyResult } from '../../okrs/key-result.entity';
import { Initiative } from '../../roadmap/initiatives/initiative.entity';
import { User } from '../../users/user.entity';
import { Milestone } from '../../roadmap/milestones/milestone.entity';
import { Priority } from '../../common/priority.enum';
import { WorkItemType } from './work-item-type.enum';
import { EntityNotFoundError, Repository } from 'typeorm';
import { WorkItemStatus } from './work-item-status.enum';
import { InitiativeStatus } from '../../roadmap/initiatives/initiativestatus.enum';
import { Sprint } from '../../sprints/sprint.entity';
import { WorkItem } from './work-item.entity';
import { SprintsService } from '../../sprints/sprints.service';
import { File } from '../../files/file.entity';
import { WorkItemFile } from './work-item-file.entity';
import { InitiativeFile } from '../../roadmap/initiatives/initiative-file.entity';
import { FilesService } from '../../files/files.service';
import { FilesStorageRepository } from '../../files/files-storage.repository';
import { WorkItemComment } from './work-item-comment.entity';
import { IssuesService } from '../../issues/issues.service';
import { Project } from '../../projects/project.entity';

describe('WorkItemsService', () => {
  let usersService: UsersService;
  let orgsService: OrgsService;
  let featuresService: InitiativesService;
  let sprintService: SprintsService;
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
          Initiative,
          User,
          Milestone,
          Sprint,
          WorkItem,
          File,
          InitiativeFile,
          WorkItemFile,
          WorkItemComment,
        ]),
      ],
      [
        OkrsService,
        OrgsService,
        InitiativesService,
        UsersService,
        MilestonesService,
        WorkItemsService,
        SprintsService,
        FilesService,
        FilesStorageRepository,
        IssuesService,
      ],
    );
    cleanup = dbCleanup;
    service = module.get<WorkItemsService>(WorkItemsService);
    sprintService = module.get<SprintsService>(SprintsService);
    featuresService = module.get<InitiativesService>(InitiativesService);
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

  async function getTestOrgAndUser() {
    const unsavedOrg = new Org();
    unsavedOrg.name = 'Premium Org';
    const org = await orgsRepository.save(unsavedOrg);

    const unsavedUser = new User(
      'Premium User',
      'premium@example.com',
      'testtesttest',
    );
    unsavedUser.org = Promise.resolve(org);
    const user = await usersRepository.save(unsavedUser);
    const project = new Project();
    project.name = 'Test Project';
    project.org = Promise.resolve(org);
    await projectsRepository.save(project);

    return { org, user, project };
  }

  describe('when creating a work item', () => {
    it('should return the created work item', async () => {
      const feature = await featuresService.createInitiative(
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
      const workItem = await service.createWorkItem(
        org.id,
        project.id,
        user.id,
        {
          title: 'my work item',
          description: 'my work item description',
          priority: Priority.HIGH,
          type: WorkItemType.USER_STORY,
          initiative: feature.id,
          status: WorkItemStatus.PLANNED,
        },
      );
      expect(workItem).toBeDefined();
      expect(workItem.id).toBeDefined();
      expect(workItem.title).toEqual('my work item');
      expect(workItem.description).toEqual('my work item description');
      expect(workItem.priority).toEqual(Priority.HIGH);
      expect(workItem.type).toEqual(WorkItemType.USER_STORY);
      expect(workItem.initiative.id).toBeDefined();
      expect(workItem.initiative.title).toEqual('my feature');
      expect(workItem.createdBy.id).toEqual(user.id);
      expect(workItem.createdBy.name).toEqual(user.name);
    });
    it('should update the feature progress', async () => {
      const feature = await featuresService.createInitiative(
        org.id,
        project.id,
        user.id,
        {
          title: 'my feature',
          description: 'my feature description',
          priority: Priority.HIGH,
          status: InitiativeStatus.IN_PROGRESS,
        },
      );
      await service.createWorkItem(org.id, project.id, user.id, {
        title: 'my work item',
        description: 'my work item description',
        priority: Priority.HIGH,
        type: WorkItemType.USER_STORY,
        estimation: 13,
        initiative: feature.id,
        status: WorkItemStatus.DONE,
      });
      await service.createWorkItem(org.id, project.id, user.id, {
        title: 'my other work item',
        description: 'my other work item description',
        priority: Priority.MEDIUM,
        type: WorkItemType.TECHNICAL_DEBT,
        estimation: 13,
        initiative: feature.id,
        status: WorkItemStatus.IN_PROGRESS,
      });
      const foundFeature = await featuresService.getInitiative(
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
      const feature = await featuresService.createInitiative(
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
      await service.createWorkItem(org.id, project.id, user.id, {
        title: 'my work item',
        description: 'my work item description',
        priority: Priority.HIGH,
        type: WorkItemType.USER_STORY,
        initiative: feature.id,
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
      const feature1 = await featuresService.createInitiative(
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
      const feature2 = await featuresService.createInitiative(
        org.id,
        project.id,
        user.id,
        {
          title: 'my other feature',
          description: 'my other feature description',
          priority: Priority.MEDIUM,
          status: InitiativeStatus.PLANNED,
        },
      );
      await service.createWorkItem(org.id, project.id, user.id, {
        title: 'my work item',
        description: 'my work item description',
        priority: Priority.HIGH,
        type: WorkItemType.USER_STORY,
        initiative: feature1.id,
        status: WorkItemStatus.PLANNED,
      });
      await service.createWorkItem(org.id, project.id, user.id, {
        title: 'my other work item',
        description: 'my other work item description',
        priority: Priority.MEDIUM,
        type: WorkItemType.TECHNICAL_DEBT,
        initiative: feature2.id,
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
      const feature = await featuresService.createInitiative(
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
      const workItem = await service.createWorkItem(
        org.id,
        project.id,
        user.id,
        {
          title: 'my work item',
          description: 'my work item description',
          priority: Priority.HIGH,
          type: WorkItemType.USER_STORY,
          initiative: feature.id,
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
      expect(foundWorkItem.initiative.id).toBeDefined();
      expect(foundWorkItem.initiative.title).toEqual('my feature');
    });
  });
  describe('when updating a work item', () => {
    it('should return the updated work item', async () => {
      const feature1 = await featuresService.createInitiative(
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
      const feature2 = await featuresService.createInitiative(
        org.id,
        project.id,
        user.id,
        {
          title: 'my other feature',
          description: 'my other feature description',
          priority: Priority.MEDIUM,
          status: InitiativeStatus.PLANNED,
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
          initiative: feature1.id,
          status: WorkItemStatus.PLANNED,
        },
      );
      const foundWorkItem = await service.updateWorkItem(
        user.id,
        org.id,
        project.id,
        workItem.id,
        {
          title: 'my work item updated',
          description: 'my work item description updated',
          mentions: [user.id],
          priority: Priority.MEDIUM,
          type: WorkItemType.TECHNICAL_DEBT,
          initiative: feature2.id,
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
      expect(foundWorkItem.initiative.id).toBeDefined();
      expect(foundWorkItem.initiative.title).toEqual('my other feature');
    });
    it('should remove the association with the feature if the feature is not provided', async () => {
      const feature = await featuresService.createInitiative(
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
      const workItem = await service.createWorkItem(
        org.id,
        project.id,
        user.id,
        {
          title: 'my work item',
          description: 'my work item description',
          priority: Priority.HIGH,
          type: WorkItemType.USER_STORY,
          initiative: feature.id,
          status: WorkItemStatus.PLANNED,
        },
      );
      const foundWorkItem = await service.updateWorkItem(
        user.id,
        org.id,
        project.id,
        workItem.id,
        {
          title: 'my work item updated',
          description: 'my work item description updated',
          mentions: [user.id],
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
      expect(foundWorkItem.initiative).toBeUndefined();
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
        user.id,
        org.id,
        project.id,
        workItem.id,
        {
          title: 'my work item updated',
          description: 'my work item description updated',
          mentions: [user.id],
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
        user.id,
        org.id,
        project.id,
        workItem.id,
        {
          title: 'my work item updated',
          description: 'my work item description updated',
          mentions: [user.id],
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
        user.id,
        org.id,
        project.id,
        workItem.id,
        {
          title: 'my work item updated',
          description: 'my work item description updated',
          mentions: [user.id],
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
        user.id,
        org.id,
        project.id,
        workItem.id,
        {
          title: 'my work item updated',
          description: 'my work item description updated',
          mentions: [user.id],
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
        user.id,
        org.id,
        project.id,
        workItem.id,
        {
          title: 'my work item updated',
          description: 'my work item description updated',
          mentions: [user.id],
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
      const feature = await featuresService.createInitiative(
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
      const workItem = await service.createWorkItem(
        org.id,
        project.id,
        user.id,
        {
          title: 'my work item',
          description: 'my work item description',
          priority: Priority.HIGH,
          type: WorkItemType.USER_STORY,
          initiative: feature.id,
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
        user.id,
        org.id,
        project.id,
        workItem.id,
        {
          title: 'my work item updated',
          description: 'my work item description updated',
          mentions: [user.id],
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
        user.id,
        org.id,
        project.id,
        workItem.id,
        {
          title: 'my work item updated',
          description: 'my work item description updated',
          mentions: [user.id],
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
      const feature1 = await featuresService.createInitiative(
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
      const feature2 = await featuresService.createInitiative(
        org.id,
        project.id,
        user.id,
        {
          title: 'my other feature',
          description: 'my other feature description',
          priority: Priority.MEDIUM,
          status: InitiativeStatus.PLANNED,
        },
      );
      await service.createWorkItem(org.id, project.id, user.id, {
        title: 'my work item',
        description: 'my work item description',
        priority: Priority.HIGH,
        type: WorkItemType.USER_STORY,
        initiative: feature1.id,
        status: WorkItemStatus.PLANNED,
      });
      await service.createWorkItem(org.id, project.id, user.id, {
        title: 'my other work item',
        description: 'my other work item description',
        priority: Priority.MEDIUM,
        type: WorkItemType.TECHNICAL_DEBT,
        initiative: feature2.id,
        status: WorkItemStatus.PLANNED,
      });
      const workItems = await service.listOpenWorkItemsWithoutSprints(
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
            initiative: expect.objectContaining({
              id: expect.any(String), // or whatever type id is
              title: 'my feature',
            }),
          }),
          expect.objectContaining({
            title: 'my other work item',
            description: 'my other work item description',
            priority: Priority.MEDIUM,
            type: WorkItemType.TECHNICAL_DEBT,
            initiative: expect.objectContaining({
              id: expect.any(String),
              title: 'my other feature',
            }),
          }),
        ]),
      );
    });
    it('should return the open work items that are not associated with an sprint', async () => {
      const sprint = await sprintService.create(org.id, project.id, {
        goal: 'my sprint description',
        startDate: '2020-01-01',
        duration: 7,
      });
      const feature1 = await featuresService.createInitiative(
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
      const feature2 = await featuresService.createInitiative(
        org.id,
        project.id,
        user.id,
        {
          title: 'my other feature',
          description: 'my other feature description',
          priority: Priority.MEDIUM,
          status: InitiativeStatus.PLANNED,
        },
      );
      await service.createWorkItem(org.id, project.id, user.id, {
        title: 'my work item',
        description: 'my work item description',
        priority: Priority.HIGH,
        type: WorkItemType.USER_STORY,
        initiative: feature1.id,
        status: WorkItemStatus.PLANNED,
        sprint: sprint.id,
      });
      await service.createWorkItem(org.id, project.id, user.id, {
        title: 'my other work item',
        description: 'my other work item description',
        priority: Priority.MEDIUM,
        type: WorkItemType.TECHNICAL_DEBT,
        initiative: feature2.id,
        status: WorkItemStatus.PLANNED,
      });
      const workItems = await service.listOpenWorkItemsWithoutSprints(
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
      expect(workItems[0].initiative.id).toBeDefined();
      expect(workItems[0].initiative.title).toEqual('my other feature');
    });
  });
  describe('when creating a work item with a feature', () => {
    it('should update the feature progress', async () => {
      const feature = await featuresService.createInitiative(
        org.id,
        project.id,
        user.id,
        {
          title: 'my feature',
          description: 'my feature description',
          priority: Priority.HIGH,
          status: InitiativeStatus.IN_PROGRESS,
        },
      );
      await service.createWorkItem(org.id, project.id, user.id, {
        title: 'my work item',
        description: 'my work item description',
        priority: Priority.HIGH,
        type: WorkItemType.USER_STORY,
        initiative: feature.id,
        estimation: 13,
        status: WorkItemStatus.DONE,
      });
      await service.createWorkItem(org.id, project.id, user.id, {
        title: 'my other work item',
        description: 'my other work item description',
        priority: Priority.MEDIUM,
        type: WorkItemType.TECHNICAL_DEBT,
        initiative: feature.id,
        estimation: 13,
        status: WorkItemStatus.IN_PROGRESS,
      });
      const foundFeature = await featuresService.getInitiative(
        org.id,
        project.id,
        feature.id,
      );
      expect(foundFeature.progress).toEqual(50);
    });
    it('should update the feature workItemsCount', async () => {
      const feature = await featuresService.createInitiative(
        org.id,
        project.id,
        user.id,
        {
          title: 'my feature',
          description: 'my feature description',
          priority: Priority.HIGH,
          status: InitiativeStatus.IN_PROGRESS,
        },
      );
      await service.createWorkItem(org.id, project.id, user.id, {
        title: 'my work item',
        description: 'my work item description',
        priority: Priority.HIGH,
        type: WorkItemType.USER_STORY,
        initiative: feature.id,
        estimation: 13,
        status: WorkItemStatus.DONE,
      });
      await service.createWorkItem(org.id, project.id, user.id, {
        title: 'my other work item',
        description: 'my other work item description',
        priority: Priority.MEDIUM,
        type: WorkItemType.TECHNICAL_DEBT,
        initiative: feature.id,
        estimation: 13,
        status: WorkItemStatus.IN_PROGRESS,
      });
      const foundFeature = await featuresService.getInitiative(
        org.id,
        project.id,
        feature.id,
      );
      expect(foundFeature.workItemsCount).toEqual(2);
    });
  });
  describe('when updating a work item with a feature', () => {
    it('should update the feature progress', async () => {
      const feature = await featuresService.createInitiative(
        org.id,
        project.id,
        user.id,
        {
          title: 'my feature',
          description: 'my feature description',
          priority: Priority.HIGH,
          status: InitiativeStatus.IN_PROGRESS,
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
          initiative: feature.id,
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
      await service.updateWorkItem(user.id, org.id, project.id, workItem1.id, {
        title: 'my work item',
        description: 'my work item description',
        priority: Priority.HIGH,
        type: WorkItemType.USER_STORY,
        estimation: 13,
        status: WorkItemStatus.DONE,
        initiative: feature.id,
      });
      await service.updateWorkItem(user.id, org.id, project.id, workItem2.id, {
        title: 'my other work item',
        description: 'my other work item description',
        priority: Priority.MEDIUM,
        type: WorkItemType.TECHNICAL_DEBT,
        estimation: 13,
        status: WorkItemStatus.IN_PROGRESS,
        initiative: feature.id,
      });
      const foundFeature = await featuresService.getInitiative(
        org.id,
        project.id,
        feature.id,
      );
      expect(foundFeature.progress).toEqual(50);
    });
    it('should update the feature workItemsCount', async () => {
      const feature = await featuresService.createInitiative(
        org.id,
        project.id,
        user.id,
        {
          title: 'my feature',
          description: 'my feature description',
          priority: Priority.HIGH,
          status: InitiativeStatus.IN_PROGRESS,
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
          initiative: feature.id,
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
          initiative: feature.id,
          status: WorkItemStatus.IN_PROGRESS,
        },
      );
      await service.updateWorkItem(user.id, org.id, project.id, workItem1.id, {
        title: 'my work item',
        description: 'my work item description',
        priority: Priority.HIGH,
        type: WorkItemType.USER_STORY,
        estimation: 13,
        status: WorkItemStatus.DONE,
        initiative: feature.id,
      });
      await service.updateWorkItem(user.id, org.id, project.id, workItem2.id, {
        title: 'my other work item',
        description: 'my other work item description',
        priority: Priority.MEDIUM,
        type: WorkItemType.TECHNICAL_DEBT,
        estimation: 13,
        status: WorkItemStatus.IN_PROGRESS,
        initiative: null,
      });
      const foundFeature = await featuresService.getInitiative(
        org.id,
        project.id,
        feature.id,
      );
      expect(foundFeature.workItemsCount).toEqual(1);
    });
    it('should update the feature progress and count when changing the feature of a work item', async () => {
      const feature1 = await featuresService.createInitiative(
        org.id,
        project.id,
        user.id,
        {
          title: 'my feature 1',
          description: 'my feature description 1',
          priority: Priority.HIGH,
          status: InitiativeStatus.IN_PROGRESS,
        },
      );
      const feature2 = await featuresService.createInitiative(
        org.id,
        project.id,
        user.id,
        {
          title: 'my feature 2',
          description: 'my feature description 2',
          priority: Priority.HIGH,
          status: InitiativeStatus.IN_PROGRESS,
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
          initiative: feature1.id,
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
          initiative: feature2.id,
          status: WorkItemStatus.IN_PROGRESS,
        },
      );
      await service.updateWorkItem(user.id, org.id, project.id, workItem1.id, {
        title: 'my work item 1',
        description: 'my work item description 1',
        priority: Priority.HIGH,
        type: WorkItemType.USER_STORY,
        estimation: 13,
        status: WorkItemStatus.DONE,
        initiative: feature2.id,
      });
      await service.updateWorkItem(user.id, org.id, project.id, workItem2.id, {
        title: 'my work item 2',
        description: 'my work item description 2',
        priority: Priority.MEDIUM,
        type: WorkItemType.TECHNICAL_DEBT,
        estimation: 13,
        status: WorkItemStatus.IN_PROGRESS,
        initiative: feature2.id,
      });
      const foundFeature1 = await featuresService.getInitiative(
        org.id,
        project.id,
        feature1.id,
      );
      expect(foundFeature1.progress).toEqual(0);
      expect(foundFeature1.workItemsCount).toEqual(0);
      const foundFeature2 = await featuresService.getInitiative(
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
      const feature = await featuresService.createInitiative(
        org.id,
        project.id,
        user.id,
        {
          title: 'my feature',
          description: 'my feature description',
          priority: Priority.HIGH,
          status: InitiativeStatus.IN_PROGRESS,
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
          initiative: feature.id,
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
          initiative: feature.id,
          status: WorkItemStatus.IN_PROGRESS,
        },
      );
      await service.deleteWorkItem(org.id, project.id, workItem1.id);
      await service.deleteWorkItem(org.id, project.id, workItem2.id);
      const foundFeature = await featuresService.getInitiative(
        org.id,
        project.id,
        feature.id,
      );
      expect(foundFeature.progress).toEqual(0);
    });
    it('should update the feature workItemsCount', async () => {
      const feature = await featuresService.createInitiative(
        org.id,
        project.id,
        user.id,
        {
          title: 'my feature',
          description: 'my feature description',
          priority: Priority.HIGH,
          status: InitiativeStatus.IN_PROGRESS,
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
          initiative: feature.id,
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
          initiative: feature.id,
          status: WorkItemStatus.IN_PROGRESS,
        },
      );
      await service.deleteWorkItem(org.id, project.id, workItem1.id);
      await service.deleteWorkItem(org.id, project.id, workItem2.id);
      const foundFeature = await featuresService.getInitiative(
        org.id,
        project.id,
        feature.id,
      );
      expect(foundFeature.workItemsCount).toEqual(0);
    });
  });
  describe('when closing a work item', () => {
    it('should update the feature progress', async () => {
      const feature = await featuresService.createInitiative(
        org.id,
        project.id,
        user.id,
        {
          title: 'my feature',
          description: 'my feature description',
          priority: Priority.MEDIUM,
          status: InitiativeStatus.IN_PROGRESS,
        },
      );
      await service.createWorkItem(org.id, project.id, user.id, {
        title: 'my work item 1',
        description: 'my work item description 1',
        priority: Priority.HIGH,
        type: WorkItemType.USER_STORY,
        estimation: 13,
        initiative: feature.id,
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
          initiative: feature.id,
          status: WorkItemStatus.IN_PROGRESS,
        },
      );
      await service.updateWorkItem(user.id, org.id, project.id, workItem2.id, {
        title: 'my work item 2',
        description: 'my work item description 2',
        priority: Priority.MEDIUM,
        type: WorkItemType.TECHNICAL_DEBT,
        estimation: 13,
        initiative: feature.id,
        status: WorkItemStatus.CLOSED,
      });
      const foundFeature = await featuresService.getInitiative(
        org.id,
        project.id,
        feature.id,
      );
      expect(foundFeature.progress).toEqual(100);
    });
  });
  describe('when patching a work item', () => {
    it('should allow to patch the sprint', async () => {
      await sprintService.create(org.id, project.id, {
        goal: 'my sprint description',
        startDate: '2020-01-01',
        duration: 7,
      });
      const sprint2 = await sprintService.create(org.id, project.id, {
        goal: 'my sprint description',
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
        sprint: sprint2.id,
      });
      const foundWorkItem = await service.getWorkItem(
        org.id,
        project.id,
        workItem.id,
      );
      expect(foundWorkItem.sprint.id).toEqual(sprint2.id);
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
      const feature = await featuresService.createInitiative(
        org.id,
        project.id,
        user.id,
        {
          title: 'my feature',
          description: 'my feature description',
          status: InitiativeStatus.IN_PROGRESS,
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
          initiative: feature.id,
          status: WorkItemStatus.IN_PROGRESS,
        },
      );
      await service.patchWorkItem(org.id, project.id, workItem.id, {
        status: WorkItemStatus.DONE,
      });
      const foundFeature = await featuresService.getInitiative(
        org.id,
        project.id,
        feature.id,
      );
      expect(foundFeature.progress).toEqual(100);
    });
    it('should update the feature progress when changing the status to CLOSED', async () => {
      const feature = await featuresService.createInitiative(
        org.id,
        project.id,
        user.id,
        {
          title: 'my feature',
          description: 'my feature description',
          status: InitiativeStatus.IN_PROGRESS,
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
          initiative: feature.id,
          status: WorkItemStatus.IN_PROGRESS,
        },
      );
      await service.patchWorkItem(org.id, project.id, workItem.id, {
        status: WorkItemStatus.CLOSED,
      });
      const foundFeature = await featuresService.getInitiative(
        org.id,
        project.id,
        feature.id,
      );
      expect(foundFeature.progress).toEqual(100);
    });
    it('should update the feature progress when changing the status to IN_PROGRESS', async () => {
      const feature = await featuresService.createInitiative(
        org.id,
        project.id,
        user.id,
        {
          title: 'my feature',
          description: 'my feature description',
          status: InitiativeStatus.IN_PROGRESS,
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
          initiative: feature.id,
          status: WorkItemStatus.DONE,
        },
      );
      await service.patchWorkItem(org.id, project.id, workItem.id, {
        status: WorkItemStatus.IN_PROGRESS,
      });
      const foundFeature = await featuresService.getInitiative(
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
      const feature1 = await featuresService.createInitiative(
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
      const feature2 = await featuresService.createInitiative(
        org.id,
        project.id,
        user.id,
        {
          title: 'my other feature',
          description: 'my other feature description',
          priority: Priority.MEDIUM,
          status: InitiativeStatus.PLANNED,
        },
      );
      await service.createWorkItem(org.id, project.id, user.id, {
        title: 'my work item',
        description: 'my work item description',
        priority: Priority.HIGH,
        type: WorkItemType.USER_STORY,
        initiative: feature1.id,
        status: WorkItemStatus.PLANNED,
      });
      await service.createWorkItem(org.id, project.id, user.id, {
        title: 'my other work item',
        description: 'my other work item description',
        priority: Priority.MEDIUM,
        type: WorkItemType.TECHNICAL_DEBT,
        initiative: feature2.id,
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
      const feature1 = await featuresService.createInitiative(
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
      const feature2 = await featuresService.createInitiative(
        org.id,
        project.id,
        user.id,
        {
          title: 'my other feature',
          description: 'my other feature description',
          priority: Priority.MEDIUM,
          status: InitiativeStatus.PLANNED,
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
          initiative: feature1.id,
          status: WorkItemStatus.PLANNED,
        },
      );
      await service.createWorkItem(org.id, project.id, user.id, {
        title: 'my other work item',
        description: 'my other work item description',
        priority: Priority.MEDIUM,
        type: WorkItemType.TECHNICAL_DEBT,
        initiative: feature2.id,
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
      const { org, user, project } = await getTestOrgAndUser();

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
          mentions: [],
        },
      );
      expect(comment).toBeDefined();
      expect(comment.content).toEqual('my comment');
      expect(comment.createdBy.id).toEqual(user.id);
      expect(comment.createdBy.name).toEqual(user.name);
    });
    describe('when creating a work item comment with mentions', () => {
      it('should create the work item comment', async () => {
        const { org, user, project } = await getTestOrgAndUser();
        const secondUser = await usersService.createUser(
          'second user',
          'second@example.com',
          'password',
          org,
        );

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
            mentions: [secondUser.id],
          },
        );
        expect(comment).toBeDefined();
        expect(comment.content).toEqual('my comment');
        expect(comment.createdBy.id).toEqual(user.id);
        expect(comment.createdBy.name).toEqual(user.name);
      });
    });
    it('should throw an error if the comment content is empty', async () => {
      const { org, user, project } = await getTestOrgAndUser();

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
            mentions: [],
          },
        ),
      ).rejects.toThrowError('Comment content is required');
    });
  });

  describe('when listing the comments of a work item', () => {
    it('should return the list of comments of the work item', async () => {
      const { org, user, project } = await getTestOrgAndUser();

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
      const { org, user, project } = await getTestOrgAndUser();

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
      const { org, user, project } = await getTestOrgAndUser();

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
          mentions: [],
        },
      );
      expect(updatedComment).toBeDefined();
      expect(updatedComment.content).toEqual('my updated comment');
    });
    it('should throw an error if the comment is empty', async () => {
      const { org, user, project } = await getTestOrgAndUser();

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
          mentions: [],
        }),
      ).rejects.toThrowError('Comment content is required');
    });
  });
  describe('when updating a work item comment with mentions', () => {
    it('should update the work item comment', async () => {
      const { org, user, project } = await getTestOrgAndUser();
      const secondUser = await usersService.createUser(
        'second user',
        'second@example.com',
        'password',
        org,
      );
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
          mentions: [secondUser.id],
        },
      );
      expect(updatedComment).toBeDefined();
      expect(updatedComment.content).toEqual('my updated comment');
    });
  });
});
