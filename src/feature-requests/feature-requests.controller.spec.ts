import { FeatureRequestsController } from './feature-requests.controller';
import { Org } from '../orgs/org.entity';
import { User } from '../users/user.entity';
import { Repository } from 'typeorm';
import { setupTestingModule } from '../../test/test.utils';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { OrgsService } from '../orgs/orgs.service';
import { UsersService } from '../users/users.service';
import { FeatureRequestsService } from './feature-requests.service';
import { PaymentPlan } from '../auth/payment.plan';
import { FeatureRequest } from './feature-request.entity';
import { FeatureRequestStatus } from './feature-request-status.enum';
import { FeatureRequestVoteService } from './feature-request-votes.service';
import { FeatureRequestVote } from './feature-request-vote.entity';
import { FeatureRequestComment } from './feature-request-comment.entity';

describe('FeatureRequestsController', () => {
  let controller: FeatureRequestsController;
  let cleanup: () => Promise<void>;
  let org: Org;
  let user: User;
  let orgsRepository: Repository<Org>;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [
        TypeOrmModule.forFeature([
          Org,
          User,
          FeatureRequest,
          FeatureRequestVote,
          FeatureRequestComment,
        ]),
        UsersModule,
      ],
      [FeatureRequestsService, FeatureRequestVoteService],
      [FeatureRequestsController],
    );
    cleanup = dbCleanup;
    controller = module.get<FeatureRequestsController>(
      FeatureRequestsController,
    );
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

  describe('when adding a new feature request', () => {
    it('should return the newly created feature request', async () => {
      const createFeatureRequestDto = {
        title: 'Test Feature Request',
        description: 'This is a test feature request',
      };
      const result = await controller.addFeatureRequest(
        {
          user: { sub: user.id },
        },
        org.id,
        createFeatureRequestDto,
      );
      expect(result.title).toBe(createFeatureRequestDto.title);
      expect(result.description).toBe(createFeatureRequestDto.description);
    });
  });
  describe('when listing feature requests', () => {
    it('should return a list of feature requests', async () => {
      const createFeatureRequestDto = {
        title: 'Test Feature Request',
        description: 'This is a test feature request',
      };
      await controller.addFeatureRequest(
        {
          user: { sub: user.id },
        },
        org.id,
        createFeatureRequestDto,
      );
      const result = await controller.listFeatureRequests(org.id);
      expect(result.length).toBe(1);
      expect(result[0].title).toBe(createFeatureRequestDto.title);
      expect(result[0].description).toBe(createFeatureRequestDto.description);
    });
  });
  describe('when getting a feature request by id', () => {
    it('should return the feature request', async () => {
      const createFeatureRequestDto = {
        title: 'Test Feature Request',
        description: 'This is a test feature request',
      };
      const { id } = await controller.addFeatureRequest(
        {
          user: { sub: user.id },
        },
        org.id,
        createFeatureRequestDto,
      );
      const result = await controller.getFeatureRequestById(org.id, id);
      expect(result.title).toBe(createFeatureRequestDto.title);
      expect(result.description).toBe(createFeatureRequestDto.description);
    });
  });
  it('should throw an error if the org does not exist', async () => {
    await expect(
      controller.getFeatureRequestById(org.id, 'non-existent-id'),
    ).rejects.toThrow();
  });
  describe('when updating a feature request', () => {
    it('should return the updated feature request', async () => {
      const createFeatureRequestDto = {
        title: 'Test Feature Request',
        description: 'This is a test feature request',
      };
      const { id } = await controller.addFeatureRequest(
        {
          user: { sub: user.id },
        },
        org.id,
        createFeatureRequestDto,
      );
      const updateFeatureRequestDto = {
        title: 'Updated Feature Request',
        description: 'This is an updated feature request',
        status: FeatureRequestStatus.IN_PROGRESS,
        estimation: null,
      };
      const result = await controller.updateFeatureRequest(
        {
          user: { sub: user.id },
        },
        org.id,
        id,
        updateFeatureRequestDto,
      );
      expect(result.title).toBe(updateFeatureRequestDto.title);
      expect(result.description).toBe(updateFeatureRequestDto.description);
    });
  });
  describe('when deleting a feature request', () => {
    it('should delete the feature request', async () => {
      const createFeatureRequestDto = {
        title: 'Test Feature Request',
        description: 'This is a test feature request',
      };
      const { id } = await controller.addFeatureRequest(
        {
          user: { sub: user.id },
        },
        org.id,
        createFeatureRequestDto,
      );
      await controller.deleteFeatureRequest(
        {
          user: { sub: user.id },
        },
        org.id,
        id,
      );
      await expect(
        controller.getFeatureRequestById(org.id, id),
      ).rejects.toThrow();
    });
  });
  describe('when upvoting a feature request', () => {
    it('should upvote the feature request', async () => {
      const createFeatureRequestDto = {
        title: 'Test Feature Request',
        description: 'This is a test feature request',
      };
      const { id } = await controller.addFeatureRequest(
        {
          user: {
            sub: user.id,
          },
        },
        org.id,
        createFeatureRequestDto,
      );
      await controller.upvoteFeatureRequest(
        {
          user: {
            sub: user.id,
          },
        },
        org.id,
        id,
      );
      const featureRequest = await controller.getFeatureRequestById(org.id, id);
      expect(featureRequest.votesCount).toEqual(1);
    });
  });
  describe('when downvoting a feature request', () => {
    it('should downvote the feature request', async () => {
      const createFeatureRequestDto = {
        title: 'Test Feature Request',
        description: 'This is a test feature request',
      };
      const { id } = await controller.addFeatureRequest(
        {
          user: {
            sub: user.id,
          },
        },
        org.id,
        createFeatureRequestDto,
      );
      await controller.downvoteFeatureRequest(
        {
          user: {
            sub: user.id,
          },
        },
        org.id,
        id,
      );
      const featureRequest = await controller.getFeatureRequestById(org.id, id);
      expect(featureRequest.votesCount).toEqual(0);
    });
  });
  describe('when adding a comment', () => {
    it('should add a comment', async () => {
      const createFeatureRequestDto = {
        title: 'Test Feature Request',
        description: 'This is a test feature request',
      };
      const { id } = await controller.addFeatureRequest(
        {
          user: {
            sub: user.id,
          },
        },
        org.id,
        createFeatureRequestDto,
      );
      const comment = await controller.addFeatureRequestComment(
        {
          user: {
            sub: user.id,
          },
        },
        id,
        {
          content: 'Test Comment',
        },
      );
      expect(comment).toBeDefined();
      expect(comment.createdBy.id).toEqual(user.id);
      expect(comment.content).toEqual('Test Comment');
    });
  });
  describe('when deleting a comment', () => {
    it('should delete the comment', async () => {
      const createFeatureRequestDto = {
        title: 'Test Feature Request',
        description: 'This is a test feature request',
      };
      const { id } = await controller.addFeatureRequest(
        {
          user: {
            sub: user.id,
          },
        },
        org.id,
        createFeatureRequestDto,
      );
      const comment = await controller.addFeatureRequestComment(
        {
          user: {
            sub: user.id,
          },
        },
        id,
        {
          content: 'Test Comment',
        },
      );
      await controller.deleteFeatureRequestComment(
        {
          user: {
            sub: user.id,
          },
        },
        id,
        comment.id,
      );
      const featureRequestDto = await controller.getFeatureRequestById(
        org.id,
        id,
      );
      expect(featureRequestDto.comments).toBeDefined();
      expect(featureRequestDto.comments.length).toEqual(0);
    });
  });
  describe('when updating a comment', () => {
    it('should update the comment', async () => {
      const createFeatureRequestDto = {
        title: 'Test Feature Request',
        description: 'This is a test feature request',
      };
      const { id } = await controller.addFeatureRequest(
        {
          user: {
            sub: user.id,
          },
        },
        org.id,
        createFeatureRequestDto,
      );
      const comment = await controller.addFeatureRequestComment(
        {
          user: {
            sub: user.id,
          },
        },
        id,
        {
          content: 'Test Comment',
        },
      );
      const updateCommentDto = {
        content: 'Updated Comment',
      };
      const updatedComment = await controller.updateFeatureRequestComment(
        {
          user: {
            sub: user.id,
          },
        },
        id,
        comment.id,
        updateCommentDto,
      );
      expect(updatedComment).toBeDefined();
      expect(updatedComment.content).toEqual('Updated Comment');
    });
  });
});
