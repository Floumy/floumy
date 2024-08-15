import { OkrsService } from '../okrs.service';
import { Repository } from 'typeorm';
import { Feature } from '../../roadmap/features/feature.entity';
import { setupTestingModule } from '../../../test/test.utils';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Objective } from '../objective.entity';
import { Org } from '../../orgs/org.entity';
import { KeyResult } from '../key-result.entity';
import { User } from '../../users/user.entity';
import { KeyResultComment } from '../key-result-comment.entity';
import { UsersService } from '../../users/users.service';
import { OrgsService } from '../../orgs/orgs.service';
import { PaymentPlan } from '../../auth/payment.plan';
import { OKRStatus } from '../okrstatus.enum';
import { CommentsService } from './comments.service';

describe('CommentsService', () => {
  let okrsService: OkrsService;
  let orgsRepository: Repository<Org>;
  let usersService: UsersService;
  let service: CommentsService;
  let user: User;
  let org: Org;

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
          KeyResultComment,
        ]),
      ],
      [OkrsService, UsersService, OrgsService, CommentsService],
    );
    cleanup = dbCleanup;
    okrsService = module.get<OkrsService>(OkrsService);
    orgsRepository = module.get<Repository<Org>>(getRepositoryToken(Org));
    usersService = module.get<UsersService>(UsersService);
    const orgsService = module.get<OrgsService>(OrgsService);
    service = module.get<CommentsService>(CommentsService);
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
    expect(okrsService).toBeDefined();
  });

  describe('when adding a comment to a key result', () => {
    it('should add a comment to the key result', async () => {
      const objective = await okrsService.createObjective(org.id, {
        title: 'Test Objective',
      });
      const keyResult = await okrsService.createKeyResult(
        org.id,
        objective.id,
        {
          title: 'Test Key Result',
          progress: 0,
          status: OKRStatus.ON_TRACK,
        },
      );
      const comment = await service.addCommentToKeyResult(
        keyResult.id,
        user.id,
        'Test Comment',
      );
      expect(comment).toBeDefined();
      expect((await comment.createdBy).id).toEqual(user.id);
      expect(comment.content).toEqual('Test Comment');
    });
    it('should throw an error if the org is not premium', async () => {
      const objective = await okrsService.createObjective(org.id, {
        title: 'Test Objective',
      });
      const keyResult = await okrsService.createKeyResult(
        org.id,
        objective.id,
        {
          title: 'Test Key Result',
          progress: 0,
          status: OKRStatus.ON_TRACK,
        },
      );
      org.paymentPlan = PaymentPlan.FREE;
      await orgsRepository.save(org);
      await expect(
        service.addCommentToKeyResult(keyResult.id, user.id, 'Test Comment'),
      ).rejects.toThrowError('You need to upgrade to premium to add comments');
    });
  });
  describe('when updating a comment for a key result', () => {
    it('should update the comment', async () => {
      org.paymentPlan = PaymentPlan.PREMIUM;
      await orgsRepository.save(org);

      const objective = await okrsService.createObjective(org.id, {
        title: 'Test Objective',
      });
      const keyResult = await okrsService.createKeyResult(
        org.id,
        objective.id,
        {
          title: 'Test Key Result',
          progress: 0,
          status: OKRStatus.ON_TRACK,
        },
      );
      const comment = await service.addCommentToKeyResult(
        keyResult.id,
        user.id,
        'Test Comment',
      );
      const updatedComment = await service.updateComment(
        user.id,
        comment.id,
        'Updated Comment',
      );
      expect(updatedComment).toBeDefined();
      expect(updatedComment.id).toEqual(comment.id);
      expect(updatedComment.content).toEqual('Updated Comment');
      expect(updatedComment.createdBy.id).toEqual(user.id);
    });
    it('should validate that the user is the creator of the comment', async () => {
      const objective = await okrsService.createObjective(org.id, {
        title: 'Test Objective',
      });
      const keyResult = await okrsService.createKeyResult(
        org.id,
        objective.id,
        {
          title: 'Test Key Result',
          progress: 0,
          status: OKRStatus.ON_TRACK,
        },
      );
      const comment = await service.addCommentToKeyResult(
        keyResult.id,
        user.id,
        'Test Comment',
      );

      const otherUser = await usersService.createUserWithOrg(
        'Other User',
        'otheruser@example.com',
        'testtesttest',
      );

      await expect(
        service.updateComment(otherUser.id, comment.id, 'Updated Comment'),
      ).rejects.toThrow();
    });
    it('should validate that the comment org is premium', async () => {
      const objective = await okrsService.createObjective(org.id, {
        title: 'Test Objective',
      });
      const keyResult = await okrsService.createKeyResult(
        org.id,
        objective.id,
        {
          title: 'Test Key Result',
          progress: 0,
          status: OKRStatus.ON_TRACK,
        },
      );
      const comment = await service.addCommentToKeyResult(
        keyResult.id,
        user.id,
        'Test Comment',
      );

      org.paymentPlan = PaymentPlan.FREE;
      await orgsRepository.save(org);

      await expect(
        service.updateComment(user.id, comment.id, 'Updated Comment'),
      ).rejects.toThrowError(
        'You need to upgrade to premium to update comments',
      );
    });
  });
  describe('when deleting a comment for a key result', () => {
    it('should delete the comment', async () => {
      org.paymentPlan = PaymentPlan.PREMIUM;
      await orgsRepository.save(org);

      const objective = await okrsService.createObjective(org.id, {
        title: 'Test Objective',
      });
      const keyResult = await okrsService.createKeyResult(
        org.id,
        objective.id,
        {
          title: 'Test Key Result',
          progress: 0,
          status: OKRStatus.ON_TRACK,
        },
      );
      const comment = await service.addCommentToKeyResult(
        keyResult.id,
        user.id,
        'Test Comment',
      );
      await service.deleteComment(user.id, comment.id);
      await expect(
        service.updateComment(user.id, comment.id, 'update'),
      ).rejects.toThrow();
    });
    it('should validate that the user is the creator of the comment', async () => {
      const objective = await okrsService.createObjective(org.id, {
        title: 'Test Objective',
      });
      const keyResult = await okrsService.createKeyResult(
        org.id,
        objective.id,
        {
          title: 'Test Key Result',
          progress: 0,
          status: OKRStatus.ON_TRACK,
        },
      );
      const comment = await service.addCommentToKeyResult(
        keyResult.id,
        user.id,
        'Test Comment',
      );

      const otherUser = await usersService.createUserWithOrg(
        'Other User',
        'otherUser@example.com',
        'testtesttest',
      );

      await expect(
        service.deleteComment(otherUser.id, comment.id),
      ).rejects.toThrow();
    });
    it('should validate that the comment org is premium', async () => {
      const objective = await okrsService.createObjective(org.id, {
        title: 'Test Objective',
      });
      const keyResult = await okrsService.createKeyResult(
        org.id,
        objective.id,
        {
          title: 'Test Key Result',
          progress: 0,
          status: OKRStatus.ON_TRACK,
        },
      );
      const comment = await service.addCommentToKeyResult(
        keyResult.id,
        user.id,
        'Test Comment',
      );

      org.paymentPlan = PaymentPlan.FREE;
      await orgsRepository.save(org);

      await expect(
        service.deleteComment(user.id, comment.id),
      ).rejects.toThrowError(
        'You need to upgrade to premium to delete comments',
      );
    });
  });
});
