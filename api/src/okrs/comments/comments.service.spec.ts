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
import { Project } from '../../projects/project.entity';

describe('CommentsService', () => {
  let okrsService: OkrsService;
  let orgsRepository: Repository<Org>;
  let usersService: UsersService;
  let service: CommentsService;
  let user: User;
  let org: Org;
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
          KeyResultComment,
          Project,
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
    project = (await org.projects)[0];
    await orgsRepository.save(org);
  });

  afterEach(async () => {
    await cleanup();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('when adding a comment to a key result', () => {
    it('should add a comment to the key result', async () => {
      const objective = await okrsService.createObjective(org.id, project.id, {
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
        org.id,
        project.id,
        keyResult.id,
        user.id,
        'Test Comment',
        [user.id],
      );
      expect(comment).toBeDefined();
      expect((await comment.createdBy).id).toEqual(user.id);
      expect(comment.content).toEqual('Test Comment');
    });
    it('should throw an error if the comment content is empty', async () => {
      const objective = await okrsService.createObjective(org.id, project.id, {
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
      await expect(
        service.addCommentToKeyResult(
          org.id,
          project.id,
          keyResult.id,
          user.id,
          '',
          [],
        ),
      ).rejects.toThrowError('Comment content is required');
    });
  });
  describe('when updating a comment for a key result', () => {
    it('should update the comment', async () => {
      org.paymentPlan = PaymentPlan.PREMIUM;
      await orgsRepository.save(org);

      const objective = await okrsService.createObjective(org.id, project.id, {
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
        org.id,
        project.id,
        keyResult.id,
        user.id,
        'Test Comment',
        [],
      );
      const updatedComment = await service.updateKeyResultComment(
        org.id,
        project.id,
        user.id,
        comment.id,
        'Updated Comment',
        [user.id],
      );
      expect(updatedComment).toBeDefined();
      expect(updatedComment.id).toEqual(comment.id);
      expect(updatedComment.content).toEqual('Updated Comment');
      expect(updatedComment.createdBy.id).toEqual(user.id);
    });
    it('should validate that the user is the creator of the comment', async () => {
      const objective = await okrsService.createObjective(org.id, project.id, {
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
        org.id,
        project.id,
        keyResult.id,
        user.id,
        'Test Comment',
        [],
      );

      const otherUser = await usersService.createUserWithOrg(
        'Other User',
        'otheruser@example.com',
        'testtesttest',
      );

      await expect(
        service.updateKeyResultComment(
          org.id,
          project.id,
          otherUser.id,
          comment.id,
          'Updated Comment',
          [],
        ),
      ).rejects.toThrow();
    });
    it('should throw an error if the comment content is empty', async () => {
      const objective = await okrsService.createObjective(org.id, project.id, {
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
        org.id,
        project.id,
        keyResult.id,
        user.id,
        'Test Comment',
        [],
      );

      await expect(
        service.updateKeyResultComment(
          org.id,
          project.id,
          user.id,
          comment.id,
          '',
          [],
        ),
      ).rejects.toThrowError('Comment content is required');
    });
  });
  describe('when deleting a comment for a key result', () => {
    it('should delete the comment', async () => {
      org.paymentPlan = PaymentPlan.PREMIUM;
      await orgsRepository.save(org);

      const objective = await okrsService.createObjective(org.id, project.id, {
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
        org.id,
        project.id,
        keyResult.id,
        user.id,
        'Test Comment',
        [],
      );
      await service.deleteKeyResultComment(
        org.id,
        project.id,
        user.id,
        comment.id,
      );
      await expect(
        service.updateKeyResultComment(
          org.id,
          project.id,
          user.id,
          comment.id,
          'update',
          [],
        ),
      ).rejects.toThrow();
    });
    it('should validate that the user is the creator of the comment', async () => {
      const objective = await okrsService.createObjective(org.id, project.id, {
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
        org.id,
        project.id,
        keyResult.id,
        user.id,
        'Test Comment',
        [],
      );

      const otherUser = await usersService.createUserWithOrg(
        'Other User',
        'otherUser@example.com',
        'testtesttest',
      );

      await expect(
        service.deleteKeyResultComment(
          org.id,
          project.id,
          otherUser.id,
          comment.id,
        ),
      ).rejects.toThrow();
    });
  });
  describe('when adding a comment to an objective', () => {
    it('should add a comment to the objective', async () => {
      const objective = await okrsService.createObjective(org.id, project.id, {
        title: 'Test Objective',
      });
      const comment = await service.addCommentToObjective(
        org.id,
        project.id,
        objective.id,
        user.id,
        'Test Comment',
        [],
      );
      expect(comment).toBeDefined();
      expect(comment.createdBy.id).toEqual(user.id);
      expect(comment.content).toEqual('Test Comment');
    });
  });
  describe('when updating a comment for an objective', () => {
    it('should update the comment', async () => {
      org.paymentPlan = PaymentPlan.PREMIUM;
      await orgsRepository.save(org);

      const objective = await okrsService.createObjective(org.id, project.id, {
        title: 'Test Objective',
      });
      const comment = await service.addCommentToObjective(
        org.id,
        project.id,
        objective.id,
        user.id,
        'Test Comment',
        [],
      );
      const updatedComment = await service.updateObjectiveComment(
        org.id,
        project.id,
        user.id,
        comment.id,
        'Updated Comment',
        [],
      );
      expect(updatedComment).toBeDefined();
      expect(updatedComment.id).toEqual(comment.id);
      expect(updatedComment.content).toEqual('Updated Comment');
      expect(updatedComment.createdBy.id).toEqual(user.id);
    });
    it('should validate that the comment content is not empty', async () => {
      const objective = await okrsService.createObjective(org.id, project.id, {
        title: 'Test Objective',
      });
      const comment = await service.addCommentToObjective(
        org.id,
        project.id,
        objective.id,
        user.id,
        'Test Comment',
        [],
      );
      await expect(
        service.updateObjectiveComment(
          org.id,
          project.id,
          user.id,
          comment.id,
          '',
          [],
        ),
      ).rejects.toThrowError('Comment content is required');
    });
  });
  describe('when deleting a comment for an objective', () => {
    it('should delete the comment', async () => {
      org.paymentPlan = PaymentPlan.PREMIUM;
      await orgsRepository.save(org);

      const objective = await okrsService.createObjective(org.id, project.id, {
        title: 'Test Objective',
      });
      const comment = await service.addCommentToObjective(
        org.id,
        project.id,
        objective.id,
        user.id,
        'Test Comment',
        [],
      );
      await service.deleteObjectiveComment(
        org.id,
        project.id,
        user.id,
        comment.id,
      );
      await expect(
        service.updateObjectiveComment(
          org.id,
          project.id,
          user.id,
          comment.id,
          'update',
          [],
        ),
      ).rejects.toThrow();
    });
  });
});
