import { FeatureRequestsService } from './feature-requests.service';
import { UsersService } from '../users/users.service';
import { OrgsService } from '../orgs/orgs.service';
import { Repository } from 'typeorm';
import { Org } from '../orgs/org.entity';
import { User } from '../users/user.entity';
import { setupTestingModule } from '../../test/test.utils';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { PaymentPlan } from '../auth/payment.plan';
import { FeatureRequest } from './feature-request.entity';
import { FeatureRequestVoteService } from './feature-request-votes.service';
import { FeatureRequestVote } from './feature-request-vote.entity';
import { uuid } from 'uuidv4';
import { FeatureRequestComment } from './feature-request-comment.entity';

// TODO: Fix this test
describe('FeatureRequestVotesService', () => {
  let usersService: UsersService;
  let orgsService: OrgsService;
  let service: FeatureRequestVoteService;
  let featureRequestService: FeatureRequestsService;
  let orgsRepository: Repository<Org>;
  let featureRequestVotesRepository: Repository<FeatureRequestVote>;
  let org: Org;
  let user: User;

  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [
        TypeOrmModule.forFeature([
          Org,
          User,
          FeatureRequestsService,
          FeatureRequestVote,
          FeatureRequest,
          FeatureRequestComment,
        ]),
      ],
      [
        FeatureRequestsService,
        FeatureRequestVoteService,
        UsersService,
        OrgsService,
      ],
    );
    cleanup = dbCleanup;
    featureRequestService = module.get<FeatureRequestsService>(
      FeatureRequestsService,
    );
    service = module.get<FeatureRequestVoteService>(FeatureRequestVoteService);
    orgsService = module.get<OrgsService>(OrgsService);
    usersService = module.get<UsersService>(UsersService);
    orgsRepository = module.get<Repository<Org>>(getRepositoryToken(Org));
    featureRequestVotesRepository = module.get<Repository<FeatureRequestVote>>(
      getRepositoryToken(FeatureRequestVote),
    );
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

  describe('when upvoting a feature request', () => {
    it('should upvote the feature request', async () => {
      const featureRequest = await featureRequestService.addFeatureRequest(
        user.id,
        org.id,
        {
          title: 'Test Feature Request',
          description: 'Test Description',
        },
      );
      await service.upvoteFeatureRequest(user.id, org.id, featureRequest.id);
      const featureRequestVote =
        await featureRequestVotesRepository.findOneByOrFail({
          user: { id: user.id },
          featureRequest: { id: featureRequest.id },
        });
      expect(featureRequestVote.vote).toEqual(1);
    });
    it('should throw an error if the feature request does not exist', async () => {
      await expect(
        service.upvoteFeatureRequest(user.id, org.id, uuid()),
      ).rejects.toThrow();
    });
    it('should throw an error if the feature request does not belong to the org', async () => {
      const featureRequest = await featureRequestService.addFeatureRequest(
        user.id,
        org.id,
        {
          title: 'Test Feature Request',
          description: 'Test Description',
        },
      );

      const otherOrg = await orgsService.createForUser(user);
      await orgsRepository.save(otherOrg);

      await expect(
        service.upvoteFeatureRequest(user.id, otherOrg.id, featureRequest.id),
      ).rejects.toThrow();
    });
    it('should throw an error if the org is not on the premium plan', async () => {
      const featureRequest = await featureRequestService.addFeatureRequest(
        user.id,
        org.id,
        {
          title: 'Test Feature Request',
          description: 'Test Description',
        },
      );
      org.paymentPlan = PaymentPlan.FREE;
      await orgsRepository.save(org);
      await expect(
        service.upvoteFeatureRequest(user.id, org.id, featureRequest.id),
      ).rejects.toThrow(
        'You need to upgrade your plan to upvote a feature request',
      );
    });
    it('should increment the votes count', async () => {
      const featureRequest = await featureRequestService.addFeatureRequest(
        user.id,
        org.id,
        {
          title: 'Test Feature Request',
          description: 'Test Description',
        },
      );
      await service.upvoteFeatureRequest(user.id, org.id, featureRequest.id);
      const featureRequestVote =
        await featureRequestVotesRepository.findOneByOrFail({
          user: { id: user.id },
          featureRequest: { id: featureRequest.id },
        });
      expect(featureRequestVote.vote).toEqual(1);
      expect(featureRequest.votesCount).toEqual(1);
    });
  });
  describe('when downvoting a feature request', () => {
    it('should downvote the feature request', async () => {
      const featureRequest = await featureRequestService.addFeatureRequest(
        user.id,
        org.id,
        {
          title: 'Test Feature Request',
          description: 'Test Description',
        },
      );
      await service.downvoteFeatureRequest(user.id, org.id, featureRequest.id);
      const featureRequestVote =
        await featureRequestVotesRepository.findOneByOrFail({
          user: { id: user.id },
          featureRequest: { id: featureRequest.id },
        });
      expect(featureRequestVote.vote).toEqual(-1);

      const updatedFeatureRequest =
        await featureRequestService.getFeatureRequestById(
          org.id,
          featureRequest.id,
        );
      expect(updatedFeatureRequest.votesCount).toEqual(0);
    });
    it('should throw an error if the feature request does not exist', async () => {
      await expect(
        service.downvoteFeatureRequest(user.id, org.id, uuid()),
      ).rejects.toThrow();
    });
    it('should throw an error if the feature request does not belong to the org', async () => {
      const featureRequest = await featureRequestService.addFeatureRequest(
        user.id,
        org.id,
        {
          title: 'Test Feature Request',
          description: 'Test Description',
        },
      );

      const otherOrg = await orgsService.createForUser(user);
      await orgsRepository.save(otherOrg);

      await expect(
        service.downvoteFeatureRequest(user.id, otherOrg.id, featureRequest.id),
      ).rejects.toThrow();
    });
    it('should throw an error if the org is not on the premium plan', async () => {
      const featureRequest = await featureRequestService.addFeatureRequest(
        user.id,
        org.id,
        {
          title: 'Test Feature Request',
          description: 'Test Description',
        },
      );
      org.paymentPlan = PaymentPlan.FREE;
      await orgsRepository.save(org);
      await expect(
        service.downvoteFeatureRequest(user.id, org.id, featureRequest.id),
      ).rejects.toThrow(
        'You need to upgrade your plan to downvote a feature request',
      );
    });
  });
  describe('when getting my votes', () => {
    it('should return my votes', async () => {
      const featureRequest = await featureRequestService.addFeatureRequest(
        user.id,
        org.id,
        {
          title: 'Test Feature Request',
          description: 'Test Description',
        },
      );

      await service.upvoteFeatureRequest(user.id, org.id, featureRequest.id);
      await service.downvoteFeatureRequest(user.id, org.id, featureRequest.id);

      const votes = await service.getVotes(user.id, org.id);

      expect(votes.length).toEqual(1);
      expect(votes[0].vote).toEqual(-1);
    });
    it('should return an empty array if there are no votes', async () => {
      const votes = await service.getVotes(user.id, org.id);

      expect(votes.length).toEqual(0);
    });
  });
});
