import { IssuesController } from './issues.controller';
import { Org } from '../orgs/org.entity';
import { User } from '../users/user.entity';
import { Repository } from 'typeorm';
import { setupTestingModule } from '../../test/test.utils';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { OrgsService } from '../orgs/orgs.service';
import { UsersService } from '../users/users.service';
import { IssuesService } from './issues.service';
import { PaymentPlan } from '../auth/payment.plan';
import { Issue } from './issue.entity';
import { IssueComment } from './issue-comment.entity';
import { IssueStatus } from './issue-status.enum';
import { Priority } from '../common/priority.enum';
import { Project } from '../projects/project.entity';

describe('IssuesController', () => {
  let controller: IssuesController;
  let cleanup: () => Promise<void>;
  let org: Org;
  let project: Project;
  let user: User;
  let orgsRepository: Repository<Org>;
  let projectsRepository: Repository<Project>;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [TypeOrmModule.forFeature([Org, User, Issue, IssueComment]), UsersModule],
      [IssuesService],
      [IssuesController],
    );
    cleanup = dbCleanup;
    controller = module.get<IssuesController>(IssuesController);
    const orgsService = module.get<OrgsService>(OrgsService);
    const usersService = module.get<UsersService>(UsersService);
    user = await usersService.createUserWithOrg(
      'Test User',
      'test@example.com',
      'testtesttest',
    );
    org = await orgsService.createForUser(user);
    orgsRepository = module.get<Repository<Org>>(getRepositoryToken(Org));
    projectsRepository = module.get<Repository<Project>>(
      getRepositoryToken(Project),
    );
    org.paymentPlan = PaymentPlan.PREMIUM;
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
    expect(controller).toBeDefined();
  });

  describe('when adding a new issue', () => {
    it('should return the newly created issue', async () => {
      const createIssueDto = {
        title: 'Test Issue',
        description: 'This is a test issue',
      };
      const result = await controller.addIssue(
        {
          user: { sub: user.id },
        },
        org.id,
        project.id,
        createIssueDto,
      );
      expect(result.title).toBe(createIssueDto.title);
      expect(result.description).toBe(createIssueDto.description);
    });
  });

  describe('when listing issues', () => {
    it('should return a list of issues', async () => {
      const createIssueDto = {
        title: 'Test Issue',
        description: 'This is a test issue',
      };
      await controller.addIssue(
        {
          user: { sub: user.id },
        },
        org.id,
        project.id,
        createIssueDto,
      );
      const result = await controller.listIssues(org.id, project.id);
      expect(result.length).toBe(1);
      expect(result[0].title).toBe(createIssueDto.title);
      expect(result[0].description).toBe(createIssueDto.description);
    });
  });

  describe('when getting an issue by id', () => {
    it('should return the issue', async () => {
      const createIssueDto = {
        title: 'Test Issue',
        description: 'This is a test issue',
      };
      const { id } = await controller.addIssue(
        {
          user: { sub: user.id },
        },
        org.id,
        project.id,
        createIssueDto,
      );
      const result = await controller.getIssueById(org.id, project.id, id);
      expect(result.title).toBe(createIssueDto.title);
      expect(result.description).toBe(createIssueDto.description);
    });

    it('should throw an error if the org does not exist', async () => {
      await expect(
        controller.getIssueById(org.id, project.id, 'non-existent-id'),
      ).rejects.toThrow();
    });
  });

  describe('when updating an issue', () => {
    it('should return the updated issue', async () => {
      const createIssueDto = {
        title: 'Test Issue',
        description: 'This is a test issue',
      };
      const { id } = await controller.addIssue(
        {
          user: { sub: user.id },
        },
        org.id,
        project.id,
        createIssueDto,
      );
      const updateIssueDto = {
        title: 'Updated Issue',
        description: 'This is an updated issue',
        status: IssueStatus.IN_PROGRESS,
        priority: Priority.HIGH,
      };
      const result = await controller.updateIssue(
        {
          user: { sub: user.id },
        },
        org.id,
        project.id,
        id,
        updateIssueDto,
      );
      expect(result.title).toBe(updateIssueDto.title);
      expect(result.description).toBe(updateIssueDto.description);
      expect(result.status).toBe(updateIssueDto.status);
      expect(result.priority).toBe(updateIssueDto.priority);
    });
  });

  describe('when deleting an issue', () => {
    it('should delete the issue', async () => {
      const createIssueDto = {
        title: 'Test Issue',
        description: 'This is a test issue',
      };
      const { id } = await controller.addIssue(
        {
          user: { sub: user.id },
        },
        org.id,
        project.id,
        createIssueDto,
      );
      await controller.deleteIssue(
        {
          user: { sub: user.id },
        },
        org.id,
        project.id,
        id,
      );
      await expect(
        controller.getIssueById(org.id, project.id, id),
      ).rejects.toThrow();
    });
  });

  describe('when adding a comment to an issue', () => {
    it('should add a comment to the issue', async () => {
      const createIssueDto = {
        title: 'Test Issue',
        description: 'This is a test issue',
      };
      const { id } = await controller.addIssue(
        {
          user: { sub: user.id },
        },
        org.id,
        project.id,
        createIssueDto,
      );
      const comment = await controller.addIssueComment(
        {
          user: { sub: user.id },
        },
        id,
        {
          content: 'Test Comment',
        },
      );
      expect(comment).toBeDefined();
      expect((await comment.createdBy).id).toEqual(user.id);
      expect(comment.content).toEqual('Test Comment');
    });
  });

  describe('when updating a comment for an issue', () => {
    it('should update the comment', async () => {
      const createIssueDto = {
        title: 'Test Issue',
        description: 'This is a test issue',
      };
      const { id } = await controller.addIssue(
        {
          user: { sub: user.id },
        },
        org.id,
        project.id,
        createIssueDto,
      );
      const comment = await controller.addIssueComment(
        {
          user: { sub: user.id },
        },
        id,
        {
          content: 'Test Comment',
        },
      );
      const updatedComment = await controller.updateIssueComment(
        {
          user: { sub: user.id },
        },
        id,
        comment.id,
        {
          content: 'Updated Comment',
        },
      );
      expect(updatedComment).toBeDefined();
      expect((await updatedComment.createdBy).id).toEqual(user.id);
      expect(updatedComment.content).toEqual('Updated Comment');
    });
  });
  describe('when deleting a comment for an issue', () => {
    it('should delete the comment', async () => {
      const createIssueDto = {
        title: 'Test Issue',
        description: 'This is a test issue',
      };
      const { id } = await controller.addIssue(
        {
          user: { sub: user.id },
        },
        org.id,
        project.id,
        createIssueDto,
      );
      const comment = await controller.addIssueComment(
        {
          user: { sub: user.id },
        },
        id,
        {
          content: 'Test Comment',
        },
      );
      await controller.deleteIssueComment(
        {
          user: { sub: user.id },
        },
        id,
        comment.id,
      );
      const result = await controller.getIssueById(org.id, project.id, id);
      expect(result.comments.length).toEqual(0);
    });
  });
  describe('when searching issues', () => {
    it('should return the issues', async () => {
      await controller.addIssue(
        {
          user: { sub: user.id },
        },
        org.id,
        project.id,
        {
          title: 'My Issue',
          description: 'My Issue Description',
        },
      );
      await controller.addIssue(
        {
          user: { sub: user.id },
        },
        org.id,
        project.id,
        {
          title: 'My Other Issue',
          description: 'My Other Issue Description',
        },
      );

      const issues = await controller.search(
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
