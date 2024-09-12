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

describe('IssuesController', () => {
  let controller: IssuesController;
  let cleanup: () => Promise<void>;
  let org: Org;
  let user: User;
  let orgsRepository: Repository<Org>;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [TypeOrmModule.forFeature([Org, User, Issue]), UsersModule],
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
    org.paymentPlan = PaymentPlan.PREMIUM;
    await orgsRepository.save(org);
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
        createIssueDto,
      );
      const result = await controller.listIssues(org.id);
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
        createIssueDto,
      );
      const result = await controller.getIssueById(org.id, id);
      expect(result.title).toBe(createIssueDto.title);
      expect(result.description).toBe(createIssueDto.description);
    });

    it('should throw an error if the org does not exist', async () => {
      await expect(
        controller.getIssueById(org.id, 'non-existent-id'),
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
        createIssueDto,
      );
      const updateIssueDto = {
        title: 'Updated Issue',
        description: 'This is an updated issue',
      };
      const result = await controller.updateIssue(
        {
          user: { sub: user.id },
        },
        org.id,
        id,
        updateIssueDto,
      );
      expect(result.title).toBe(updateIssueDto.title);
      expect(result.description).toBe(updateIssueDto.description);
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
        createIssueDto,
      );
      await controller.deleteIssue(
        {
          user: { sub: user.id },
        },
        org.id,
        id,
      );
      await expect(controller.getIssueById(org.id, id)).rejects.toThrow();
    });
  });
});
