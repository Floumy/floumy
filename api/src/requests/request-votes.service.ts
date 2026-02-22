import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Repository } from 'typeorm';
import { Request } from './request.entity';
import { RequestVote } from './request-vote.entity';

@Injectable()
export class RequestVoteService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Request)
    private requestRepository: Repository<Request>,
    @InjectRepository(RequestVote)
    private requestVoteRepository: Repository<RequestVote>,
  ) {}

  async upvoteRequest(
    userId: string,
    orgId: string,
    projectId: string,
    requestId: string,
  ) {
    await this.userRepository.findOneByOrFail({ id: userId });

    const request = await this.requestRepository.findOneByOrFail({
      id: requestId,
      org: { id: orgId },
      project: { id: projectId },
    });
    let userRequestVote = await this.requestVoteRepository.findOneBy({
      user: { id: userId },
      request: { id: requestId },
    });

    const user = await this.userRepository.findOneByOrFail({ id: userId });
    if (!userRequestVote) {
      userRequestVote = new RequestVote();
      userRequestVote.user = Promise.resolve(user);
      userRequestVote.request = Promise.resolve(request);
    }

    if (userRequestVote.vote === 1) {
      return;
    }

    userRequestVote.vote = 1;

    await this.requestVoteRepository.save(userRequestVote);

    request.votesCount++;
    await this.requestRepository.save(request);
  }

  async downvoteRequest(
    userId: string,
    orgId: string,
    projectId: string,
    requestId: string,
  ) {
    const request = await this.requestRepository.findOneByOrFail({
      id: requestId,
      org: { id: orgId },
      project: { id: projectId },
    });

    let userRequestVote = await this.requestVoteRepository.findOneBy({
      user: { id: userId },
      request: { id: requestId },
    });

    const user = await this.userRepository.findOneByOrFail({ id: userId });

    if (!userRequestVote) {
      userRequestVote = new RequestVote();
      userRequestVote.user = Promise.resolve(user);
      userRequestVote.request = Promise.resolve(request);
    }

    if (userRequestVote.vote === -1) {
      return;
    }

    userRequestVote.vote = -1;

    await this.requestVoteRepository.save(userRequestVote);

    request.votesCount--;
    await this.requestRepository.save(request);
  }

  async getVotes(userId: string, orgId: string, projectId: string) {
    const votes = await this.requestVoteRepository.find({
      where: {
        user: { id: userId },
        request: {
          org: { id: orgId },
          project: { id: projectId },
        },
      },
    });

    return await Promise.all(
      votes.map(async (vote) => {
        const request = await vote.request;
        return {
          id: vote.id,
          request: {
            id: request.id,
          },
          vote: vote.vote,
          createdAt: vote.createdAt,
        };
      }),
    );
  }
}
