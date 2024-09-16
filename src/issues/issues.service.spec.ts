import { IssuesService } from './issues.service';
import { UsersService } from '../users/users.service';
import { OrgsService } from '../orgs/orgs.service';
import { Repository } from 'typeorm';
import { Org } from '../orgs/org.entity';
import { User } from '../users/user.entity';
import { setupTestingModule } from '../../test/test.utils';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Issue } from './issue.entity';
import { PaymentPlan } from '../auth/payment.plan';
import { IssueComment } from './issue-comment.entity';

describe('IssuesService', () => {
  let usersService: UsersService;
  let orgsService: OrgsService;
  let service: IssuesService;
  let orgsRepository: Repository<Org>;
  let org: Org;
  let user: User;

  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [TypeOrmModule.forFeature([Org, User, Issue, IssueComment])],
      [IssuesService, UsersService, OrgsService],
    );
    cleanup = dbCleanup;
    service = module.get<IssuesService>(IssuesService);
    orgsService = module.get<OrgsService>(OrgsService);
    usersService = module.get<UsersService>(UsersService);
    orgsRepository = module.get<Repository<Org>>(getRepositoryToken(Org));
    user = await usersService.createUserWithOrg(
      'Test User',
      'test@example.com',
      'testtesttest',
    );
    org = await orgsService.createForUser(user);
    org.paymentPlan = PaymentPlan.PREMIUM;
    await orgsRepository.save(org);
  });

  afterEach(async () => {
    await cleanup();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('when adding a new issue', () => {
    it('should create a new issue', async () => {
      const issue = await service.addIssue(user.id, org.id, {
        title: 'Test Issue',
        description: 'Test Description',
      });

      expect(issue).toBeDefined();
      expect(issue.id).toBeDefined();
      expect(issue.title).toEqual('Test Issue');
      expect(issue.description).toEqual('Test Description');
    });

    it('should create a new issue only if the org is premium', () => {
      const freeOrg = orgsRepository.create({
        name: 'Free Org',
        paymentPlan: PaymentPlan.FREE,
      });

      expect(
        service.addIssue(user.id, freeOrg.id, {
          title: 'Test Issue',
          description: 'Test Description',
        }),
      ).rejects.toThrow();
    });
  });

  describe('when listing issues', () => {
    it('should return all issues for the org', async () => {
      await service.addIssue(user.id, org.id, {
        title: 'Test Issue 1',
        description: 'Test Description 1',
      });
      await service.addIssue(user.id, org.id, {
        title: 'Test Issue 2',
        description: 'Test Description 2',
      });

      const issues = await service.listIssues(org.id);
      expect(issues).toHaveLength(2);
      expect(issues[0].title).toEqual('Test Issue 2');
      expect(issues[1].title).toEqual('Test Issue 1');
    });

    it('should return an empty array if there are no issues', async () => {
      const issues = await service.listIssues(org.id);
      expect(issues).toHaveLength(0);
    });

    it('should return the issues in pages', async () => {
      await service.addIssue(user.id, org.id, {
        title: 'Test Issue 1',
        description: 'Test Description 1',
      });
      await service.addIssue(user.id, org.id, {
        title: 'Test Issue 2',
        description: 'Test Description 2',
      });

      const issues = await service.listIssues(org.id, 1, 1);
      expect(issues).toHaveLength(1);
      expect(issues[0].title).toEqual('Test Issue 2');
    });

    it('should throw an error if the org is not on the premium plan', async () => {
      const freeOrg = orgsRepository.create({
        name: 'Free Org',
        paymentPlan: PaymentPlan.FREE,
      });

      await expect(service.listIssues(freeOrg.id)).rejects.toThrow();
    });
  });

  describe('when getting an issue by id', () => {
    it('should return the issue', async () => {
      const issue = await service.addIssue(user.id, org.id, {
        title: 'Test Issue',
        description: 'Test Description',
      });

      const foundIssue = await service.getIssueById(org.id, issue.id);
      expect(foundIssue).toBeDefined();
      expect(foundIssue.id).toEqual(issue.id);
      expect(foundIssue.title).toEqual('Test Issue');
      expect(foundIssue.description).toEqual('Test Description');
    });

    it('should throw an error if the issue does not exist', async () => {
      await expect(
        service.getIssueById(org.id, 'some-invalid-id'),
      ).rejects.toThrow();
    });

    it('should throw an error if the issue does not belong to the org', async () => {
      const issue = await service.addIssue(user.id, org.id, {
        title: 'Test Issue',
        description: 'Test Description',
      });

      const otherOrg = await orgsService.createForUser(user);
      await orgsRepository.save(otherOrg);

      await expect(
        service.getIssueById(otherOrg.id, issue.id),
      ).rejects.toThrow();
    });

    it('should throw an error if the org is not on the premium plan', async () => {
      const issue = await service.addIssue(user.id, org.id, {
        title: 'Test Issue',
        description: 'Test Description',
      });
      org.paymentPlan = PaymentPlan.FREE;
      await orgsRepository.save(org);
      await expect(service.getIssueById(org.id, issue.id)).rejects.toThrow();
    });
  });

  describe('when updating an issue', () => {
    it('should update the issue', async () => {
      const issue = await service.addIssue(user.id, org.id, {
        title: 'Test Issue',
        description: 'Test Description',
      });

      const updatedIssue = await service.updateIssue(
        user.id,
        org.id,
        issue.id,
        {
          title: 'Updated Issue',
          description: 'Updated Description',
        },
      );

      expect(updatedIssue).toBeDefined();
      expect(updatedIssue.id).toEqual(issue.id);
      expect(updatedIssue.title).toEqual('Updated Issue');
      expect(updatedIssue.description).toEqual('Updated Description');
    });

    it('should throw an error if the issue does not exist', async () => {
      await expect(
        service.updateIssue(user.id, org.id, 'some-invalid-id', {
          title: 'Updated Issue',
          description: 'Updated Description',
        }),
      ).rejects.toThrow();
    });

    it('should throw an error if the issue does not belong to the org', async () => {
      const issue = await service.addIssue(user.id, org.id, {
        title: 'Test Issue',
        description: 'Test Description',
      });

      const otherOrg = await orgsService.createForUser(user);
      await orgsRepository.save(otherOrg);

      await expect(
        service.updateIssue(user.id, otherOrg.id, issue.id, {
          title: 'Updated Issue',
          description: 'Updated Description',
        }),
      ).rejects.toThrow();
    });

    it('should throw an error if the user does not belong to the org', async () => {
      const issue = await service.addIssue(user.id, org.id, {
        title: 'Test Issue',
        description: 'Test Description',
      });

      const otherUser = await usersService.createUserWithOrg(
        'Other User',
        'otheruser@example.com',
        'testtesttest',
      );

      await expect(
        service.updateIssue(otherUser.id, org.id, issue.id, {
          title: 'Updated Issue',
          description: 'Updated Description',
        }),
      ).rejects.toThrow();
    });

    it('should throw an error if the org is not on the premium plan', async () => {
      const issue = await service.addIssue(user.id, org.id, {
        title: 'Test Issue',
        description: 'Test Description',
      });
      org.paymentPlan = PaymentPlan.FREE;
      await orgsRepository.save(org);
      await expect(
        service.updateIssue(user.id, org.id, issue.id, {
          title: 'Updated Issue',
          description: 'Updated Description',
        }),
      ).rejects.toThrow('You need to upgrade your plan to update an issue');
    });
  });

  describe('when deleting an issue', () => {
    it('should delete the issue', async () => {
      const issue = await service.addIssue(user.id, org.id, {
        title: 'Test Issue',
        description: 'Test Description',
      });

      await service.deleteIssue(user.id, org.id, issue.id);

      await expect(service.getIssueById(org.id, issue.id)).rejects.toThrow();
    });

    it('should throw an error if the issue does not exist', async () => {
      await expect(
        service.deleteIssue(user.id, org.id, 'some-invalid-id'),
      ).rejects.toThrow();
    });

    it('should throw an error if the issue does not belong to the org', async () => {
      const issue = await service.addIssue(user.id, org.id, {
        title: 'Test Issue',
        description: 'Test Description',
      });

      const otherOrg = await orgsService.createForUser(user);
      await orgsRepository.save(otherOrg);

      await expect(
        service.deleteIssue(user.id, otherOrg.id, issue.id),
      ).rejects.toThrow();
    });

    it('should throw an error if the org is not on the premium plan', async () => {
      const issue = await service.addIssue(user.id, org.id, {
        title: 'Test Issue',
        description: 'Test Description',
      });
      org.paymentPlan = PaymentPlan.FREE;
      await orgsRepository.save(org);
      await expect(
        service.deleteIssue(user.id, org.id, issue.id),
      ).rejects.toThrow('You need to upgrade your plan to delete an issue');
    });
  });

  describe('when adding a comment to an issue', () => {
    it('should add a comment to the issue', async () => {
      const issue = await service.addIssue(user.id, org.id, {
        title: 'Test Issue',
        description: 'Test Description',
      });
      const comment = await service.createIssueComment(user.id, issue.id, {
        content: 'Test Comment',
      });
      expect(comment).toBeDefined();
      expect((await comment.createdBy).id).toEqual(user.id);
      expect(comment.content).toEqual('Test Comment');
    });
  });

  describe('when updating a comment for an issue', () => {
    it('should update the comment', async () => {
      const issue = await service.addIssue(user.id, org.id, {
        title: 'Test Issue',
        description: 'Test Description',
      });
      const comment = await service.createIssueComment(user.id, issue.id, {
        content: 'Test Comment',
      });
      const updatedComment = await service.updateIssueComment(
        user.id,
        issue.id,
        comment.id,
        {
          content: 'Updated Comment',
        },
      );
      expect(updatedComment).toBeDefined();
      expect(updatedComment.id).toEqual(comment.id);
      expect(updatedComment.content).toEqual('Updated Comment');
    });
  });

  describe('when deleting a comment for an issue', () => {
    it('should delete the comment', async () => {
      const issue = await service.addIssue(user.id, org.id, {
        title: 'Test Issue',
        description: 'Test Description',
      });
      const comment = await service.createIssueComment(user.id, issue.id, {
        content: 'Test Comment',
      });
      await service.deleteIssueComment(user.id, issue.id, comment.id);
      await expect(
        service.updateIssueComment(user.id, issue.id, comment.id, {
          content: 'Updated Comment',
        }),
      ).rejects.toThrow();
    });
  });
});
