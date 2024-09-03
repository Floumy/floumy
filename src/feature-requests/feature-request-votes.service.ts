import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Repository } from 'typeorm';
import { Org } from '../orgs/org.entity';
import { FeatureRequest } from './feature-request.entity';
import { FeatureRequestVote } from './feature-request-vote.entity';
import { PaymentPlan } from '../auth/payment.plan';

@Injectable()
export class FeatureRequestVoteService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Org)
    private orgRepository: Repository<Org>,
    @InjectRepository(FeatureRequest)
    private featureRequestRepository: Repository<FeatureRequest>,
    @InjectRepository(FeatureRequestVote)
    private featureRequestVoteRepository: Repository<FeatureRequestVote>,
  ) {}

  async upvoteFeatureRequest(
    userId: string,
    orgId: string,
    featureRequestId: string,
  ) {
    await this.userRepository.findOneByOrFail({ id: userId });

    const featureRequest = await this.featureRequestRepository.findOneByOrFail({
      id: featureRequestId,
      org: { id: orgId },
    });
    const org = await featureRequest.org;
    if (org.paymentPlan !== PaymentPlan.PREMIUM) {
      throw new Error(
        'You need to upgrade your plan to upvote a feature request',
      );
    }
    let userFeatureRequestVote =
      await this.featureRequestVoteRepository.findOneBy({
        user: { id: userId },
        featureRequest: { id: featureRequestId },
      });

    const user = await this.userRepository.findOneByOrFail({ id: userId });
    if (!userFeatureRequestVote) {
      userFeatureRequestVote = new FeatureRequestVote();
      userFeatureRequestVote.user = Promise.resolve(user);
      userFeatureRequestVote.featureRequest = Promise.resolve(featureRequest);
    }

    if (userFeatureRequestVote.vote === 1) {
      return;
    }

    userFeatureRequestVote.vote = 1;

    await this.featureRequestVoteRepository.save(userFeatureRequestVote);

    featureRequest.votesCount++;
    await this.featureRequestRepository.save(featureRequest);
  }
}
