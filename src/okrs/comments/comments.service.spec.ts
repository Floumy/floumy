import { CommentsService } from './comments.service';
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

describe('CommentsService', () => {
  let service: OkrsService;
  let orgsRepository: Repository<Org>;
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
      [OkrsService, UsersService, OrgsService],
    );
    cleanup = dbCleanup;
    service = module.get<OkrsService>(OkrsService);
    orgsRepository = module.get<Repository<Org>>(getRepositoryToken(Org));
    const usersService = module.get<UsersService>(UsersService);
    const orgsService = module.get<OrgsService>(OrgsService);
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

  describe('when adding a comment to a key result', () => {
    it('should add a comment to the key result', async () => {
      const objective = await service.createObjective(org.id, {
        title: 'Test Objective',
      });
      const keyResult = await service.createKeyResult(org.id, objective.id, {
        title: 'Test Key Result',
        progress: 0,
        status: OKRStatus.ON_TRACK,
      });
      const comment = await service.addCommentToKeyResult(
        keyResult.id,
        user.id,
        'Test Comment',
      );
      expect(comment).toBeDefined();
      expect((await comment.keyResult).id).toEqual(keyResult.id);
      expect((await comment.createdBy).id).toEqual(user.id);
      expect(comment.content).toEqual('Test Comment');
    });
    it('should throw an error if the org is not premium', async () => {
      const objective = await service.createObjective(org.id, {
        title: 'Test Objective',
      });
      const keyResult = await service.createKeyResult(org.id, objective.id, {
        title: 'Test Key Result',
        progress: 0,
        status: OKRStatus.ON_TRACK,
      });
      org.paymentPlan = PaymentPlan.FREE;
      await orgsRepository.save(org);
      await expect(
        service.addCommentToKeyResult(keyResult.id, user.id, 'Test Comment'),
      ).rejects.toThrowError('You need to upgrade to premium to add comments');
    });
  });
});
