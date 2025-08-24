import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Repository } from 'typeorm';
import { FeatureRequest } from './feature-request.entity';
import { FeatureRequestVote } from './feature-request-vote.entity';

@Injectable()
export class FeatureRequestVoteService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(FeatureRequest)
    private featureRequestRepository: Repository<FeatureRequest>,
    @InjectRepository(FeatureRequestVote)
    private featureRequestVoteRepository: Repository<FeatureRequestVote>,
  ) {}

  async upvoteFeatureRequest(
    userId: string,
    orgId: string,
    projectId: string,
    featureRequestId: string,
  ) {
    await this.userRepository.findOneByOrFail({ id: userId });

    const featureRequest = await this.featureRequestRepository.findOneByOrFail({
      id: featureRequestId,
      org: { id: orgId },
      project: { id: projectId },
    });

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

  async downvoteFeatureRequest(
    userId: string,
    orgId: string,
    projectId: string,
    featureRequestId: string,
  ) {
    const featureRequest = await this.featureRequestRepository.findOneByOrFail({
      id: featureRequestId,
      org: { id: orgId },
      project: { id: projectId },
    });

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

    if (userFeatureRequestVote.vote === -1) {
      return;
    }

    userFeatureRequestVote.vote = -1;

    await this.featureRequestVoteRepository.save(userFeatureRequestVote);

    featureRequest.votesCount--;
    await this.featureRequestRepository.save(featureRequest);
  }

  async getVotes(userId: string, orgId: string, projectId: string) {
    const votes = await this.featureRequestVoteRepository.find({
      where: {
        user: { id: userId },
        featureRequest: {
          org: { id: orgId },
          project: { id: projectId },
        },
      },
    });

    return await Promise.all(
      votes.map(async (vote) => {
        const featureRequest = await vote.featureRequest;
        return {
          id: vote.id,
          featureRequest: {
            id: featureRequest.id,
          },
          vote: vote.vote,
          createdAt: vote.createdAt,
        };
      }),
    );
  }
}
