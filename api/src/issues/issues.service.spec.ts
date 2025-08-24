import { IssuesService } from './issues.service';
import { UsersService } from '../users/users.service';
import { OrgsService } from '../orgs/orgs.service';
import { Repository } from 'typeorm';
import { Org } from '../orgs/org.entity';
import { User } from '../users/user.entity';
import { setupTestingModule } from '../../test/test.utils';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Issue } from './issue.entity';
import { IssueComment } from './issue-comment.entity';
import { IssueStatus } from './issue-status.enum';
import { Priority } from '../common/priority.enum';
import { Project } from '../projects/project.entity';
import { WorkItem } from '../backlog/work-items/work-item.entity';

describe('IssuesService', () => {
  let usersService: UsersService;
  let orgsService: OrgsService;
  let service: IssuesService;
  let orgsRepository: Repository<Org>;
  let projectsRepository: Repository<Project>;
  let workItemsRepository: Repository<WorkItem>;
  let issuesRepository: Repository<Issue>;
  let org: Org;
  let project: Project;
  let user: User;

  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [TypeOrmModule.forFeature([Org, User, Issue, IssueComment, WorkItem])],
      [IssuesService, UsersService, OrgsService],
    );
    cleanup = dbCleanup;
    service = module.get<IssuesService>(IssuesService);
    orgsService = module.get<OrgsService>(OrgsService);
    usersService = module.get<UsersService>(UsersService);
    orgsRepository = module.get<Repository<Org>>(getRepositoryToken(Org));
    projectsRepository = module.get<Repository<Project>>(
      getRepositoryToken(Project),
    );
    workItemsRepository = module.get<Repository<WorkItem>>(
      getRepositoryToken(WorkItem),
    );
    issuesRepository = module.get<Repository<Issue>>(getRepositoryToken(Issue));
    user = await usersService.createUserWithOrg(
      'Test User',
      'test@example.com',
      'testtesttest',
    );
    org = await orgsService.createForUser(user);
    await orgsRepository.save(org);
    project = new Project();
    project.name = 'Test Project';
    project.org = Promise.resolve(org);
    await projectsRepository.save(project);
  });

  afterEach(async () => {
    await cleanup();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('when adding a new issue', () => {
    it('should create a new issue', async () => {
      const issue = await service.addIssue(user.id, org.id, project.id, {
        title: 'Test Issue',
        description: 'Test Description',
      });

      expect(issue).toBeDefined();
      expect(issue.id).toBeDefined();
      expect(issue.title).toEqual('Test Issue');
      expect(issue.description).toEqual('Test Description');
      expect(issue.status).toEqual(IssueStatus.SUBMITTED);
      expect(issue.priority).toEqual(Priority.MEDIUM);
    });
  });

  describe('when listing issues', () => {
    it('should return all issues for the org', async () => {
      await service.addIssue(user.id, org.id, project.id, {
        title: 'Test Issue 1',
        description: 'Test Description 1',
      });
      await service.addIssue(user.id, org.id, project.id, {
        title: 'Test Issue 2',
        description: 'Test Description 2',
      });

      const issues = await service.listIssues(org.id, project.id);
      expect(issues).toHaveLength(2);
      expect(issues[0].title).toEqual('Test Issue 2');
      expect(issues[1].title).toEqual('Test Issue 1');
    });

    it('should return an empty array if there are no issues', async () => {
      const issues = await service.listIssues(org.id, project.id);
      expect(issues).toHaveLength(0);
    });

    it('should return the issues in pages', async () => {
      await service.addIssue(user.id, org.id, project.id, {
        title: 'Test Issue 1',
        description: 'Test Description 1',
      });
      await service.addIssue(user.id, org.id, project.id, {
        title: 'Test Issue 2',
        description: 'Test Description 2',
      });

      const issues = await service.listIssues(org.id, project.id, 1, 1);
      expect(issues).toHaveLength(1);
      expect(issues[0].title).toEqual('Test Issue 2');
    });
  });

  describe('when getting an issue by id', () => {
    it('should return the issue', async () => {
      const issue = await service.addIssue(user.id, org.id, project.id, {
        title: 'Test Issue',
        description: 'Test Description',
      });

      const foundIssue = await service.getIssueById(
        org.id,
        project.id,
        issue.id,
      );
      expect(foundIssue).toBeDefined();
      expect(foundIssue.id).toEqual(issue.id);
      expect(foundIssue.title).toEqual('Test Issue');
      expect(foundIssue.description).toEqual('Test Description');
    });

    it('should throw an error if the issue does not exist', async () => {
      await expect(
        service.getIssueById(org.id, project.id, 'some-invalid-id'),
      ).rejects.toThrow();
    });

    it('should throw an error if the issue does not belong to the org', async () => {
      const issue = await service.addIssue(user.id, org.id, project.id, {
        title: 'Test Issue',
        description: 'Test Description',
      });

      const otherOrg = await orgsService.createForUser(user);
      await orgsRepository.save(otherOrg);

      await expect(
        service.getIssueById(otherOrg.id, project.id, issue.id),
      ).rejects.toThrow();
    });
  });

  describe('when updating an issue', () => {
    it('should update the issue', async () => {
      const issue = await service.addIssue(user.id, org.id, project.id, {
        title: 'Test Issue',
        description: 'Test Description',
      });

      const updatedIssue = await service.updateIssue(
        user.id,
        org.id,
        project.id,
        issue.id,
        {
          title: 'Updated Issue',
          description: 'Updated Description',
          status: IssueStatus.IN_PROGRESS,
          priority: Priority.HIGH,
        },
      );

      expect(updatedIssue).toBeDefined();
      expect(updatedIssue.id).toEqual(issue.id);
      expect(updatedIssue.title).toEqual('Updated Issue');
      expect(updatedIssue.description).toEqual('Updated Description');
      expect(updatedIssue.status).toEqual(IssueStatus.IN_PROGRESS);
      expect(updatedIssue.priority).toEqual(Priority.HIGH);
    });

    it('should throw an error if the issue does not exist', async () => {
      await expect(
        service.updateIssue(user.id, org.id, project.id, 'some-invalid-id', {
          title: 'Updated Issue',
          description: 'Updated Description',
          status: IssueStatus.IN_PROGRESS,
          priority: Priority.HIGH,
        }),
      ).rejects.toThrow();
    });

    it('should throw an error if the issue does not belong to the org', async () => {
      const issue = await service.addIssue(user.id, org.id, project.id, {
        title: 'Test Issue',
        description: 'Test Description',
      });

      const otherOrg = await orgsService.createForUser(user);
      await orgsRepository.save(otherOrg);

      await expect(
        service.updateIssue(user.id, otherOrg.id, project.id, issue.id, {
          title: 'Updated Issue',
          description: 'Updated Description',
          status: IssueStatus.IN_PROGRESS,
          priority: Priority.HIGH,
        }),
      ).rejects.toThrow();
    });

    it('should throw an error if the user does not belong to the org', async () => {
      const issue = await service.addIssue(user.id, org.id, project.id, {
        title: 'Test Issue',
        description: 'Test Description',
      });

      const otherUser = await usersService.createUserWithOrg(
        'Other User',
        'otheruser@example.com',
        'testtesttest',
      );

      await expect(
        service.updateIssue(otherUser.id, org.id, project.id, issue.id, {
          title: 'Updated Issue',
          description: 'Updated Description',
          status: IssueStatus.IN_PROGRESS,
          priority: Priority.HIGH,
        }),
      ).rejects.toThrow();
    });
  });

  describe('when deleting an issue', () => {
    it('should delete the issue', async () => {
      const issue = await service.addIssue(user.id, org.id, project.id, {
        title: 'Test Issue',
        description: 'Test Description',
      });

      await service.deleteIssue(user.id, org.id, project.id, issue.id);

      await expect(
        service.getIssueById(org.id, project.id, issue.id),
      ).rejects.toThrow();
    });

    it('should throw an error if the issue does not exist', async () => {
      await expect(
        service.deleteIssue(user.id, org.id, project.id, 'some-invalid-id'),
      ).rejects.toThrow();
    });

    it('should throw an error if the issue does not belong to the org', async () => {
      const issue = await service.addIssue(user.id, org.id, project.id, {
        title: 'Test Issue',
        description: 'Test Description',
      });

      const otherOrg = await orgsService.createForUser(user);
      await orgsRepository.save(otherOrg);

      await expect(
        service.deleteIssue(user.id, otherOrg.id, project.id, issue.id),
      ).rejects.toThrow();
    });

    it('should remove the issue from the work items', async () => {
      const issue = new Issue();
      issue.title = 'Test Issue';
      issue.description = 'Test Description';
      issue.org = Promise.resolve(org);
      issue.project = Promise.resolve(project);
      issue.createdBy = Promise.resolve(user);
      await issuesRepository.save(issue);
      const workItem = new WorkItem();
      workItem.title = 'Test Work Item';
      workItem.description = 'Test Work Item Description';
      workItem.org = Promise.resolve(org);
      workItem.project = Promise.resolve(project);
      workItem.issue = Promise.resolve(issue);
      await workItemsRepository.save(workItem);
      await service.deleteIssue(user.id, org.id, project.id, issue.id);
      const workItems = await workItemsRepository.find({
        where: { issue: { id: issue.id } },
      });
      expect(workItems.length).toEqual(0);
    });
  });

  describe('when adding a comment to an issue', () => {
    it('should add a comment to the issue', async () => {
      const issue = await service.addIssue(user.id, org.id, project.id, {
        title: 'Test Issue',
        description: 'Test Description',
      });
      const comment = await service.createIssueComment(user.id, issue.id, {
        content: 'Test Comment',
        mentions: [user.id],
      });
      expect(comment).toBeDefined();
      expect((await comment.createdBy).id).toEqual(user.id);
      expect(comment.content).toEqual('Test Comment');
    });
  });

  describe('when updating a comment for an issue', () => {
    it('should update the comment', async () => {
      const issue = await service.addIssue(user.id, org.id, project.id, {
        title: 'Test Issue',
        description: 'Test Description',
      });
      const comment = await service.createIssueComment(user.id, issue.id, {
        content: 'Test Comment',
        mentions: [],
      });
      const updatedComment = await service.updateIssueComment(
        user.id,
        issue.id,
        comment.id,
        {
          content: 'Updated Comment',
          mentions: [user.id],
        },
      );
      expect(updatedComment).toBeDefined();
      expect(updatedComment.id).toEqual(comment.id);
      expect(updatedComment.content).toEqual('Updated Comment');
    });
  });

  describe('when deleting a comment for an issue', () => {
    it('should delete the comment', async () => {
      const issue = await service.addIssue(user.id, org.id, project.id, {
        title: 'Test Issue',
        description: 'Test Description',
      });
      const comment = await service.createIssueComment(user.id, issue.id, {
        content: 'Test Comment',
        mentions: [],
      });
      await service.deleteIssueComment(user.id, issue.id, comment.id);
      await expect(
        service.updateIssueComment(user.id, issue.id, comment.id, {
          content: 'Updated Comment',
          mentions: [],
        }),
      ).rejects.toThrow();
    });
  });

  describe('when searching issues', () => {
    it('should return the issues', async () => {
      await service.addIssue(user.id, org.id, project.id, {
        title: 'My Issue',
        description: 'My Issue Description',
      });
      await service.addIssue(user.id, org.id, project.id, {
        title: 'My Other Issue',
        description: 'My Other Issue Description',
      });

      const issues = await service.searchIssues(
        org.id,
        project.id,
        'my issue',
        1,
        1,
      );
      expect(issues).toHaveLength(1);
      expect(issues[0].title).toEqual('My Issue');
      expect(issues[0].description).toEqual('My Issue Description');
    });
  });
});
