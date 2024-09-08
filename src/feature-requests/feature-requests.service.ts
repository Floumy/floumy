import { Injectable } from '@nestjs/common';
import {
  CreateFeatureRequestDto,
  FeatureRequestDto,
  UpdateFeatureRequestDto,
} from './dtos';
import { InjectRepository } from '@nestjs/typeorm';
import { FeatureRequest } from './feature-request.entity';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { Org } from '../orgs/org.entity';
import { PaymentPlan } from '../auth/payment.plan';
import { FeatureRequestsMapper } from './feature-requests.mapper';
import { FeatureRequestStatus } from './feature-request-status.enum';
import { FeatureRequestVote } from './feature-request-vote.entity';
import { CommentMapper } from '../comments/mappers';
import { CreateUpdateCommentDto } from '../comments/dtos';
import { FeatureRequestComment } from './feature-request-comment.entity';

@Injectable()
export class FeatureRequestsService {
  constructor(
    @InjectRepository(FeatureRequest)
    private featureRequestsRepository: Repository<FeatureRequest>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Org)
    private orgsRepository: Repository<Org>,
    @InjectRepository(FeatureRequestVote)
    private featureRequestVotesRepository: Repository<FeatureRequestVote>,
    @InjectRepository(FeatureRequestComment)
    private featureRequestCommentsRepository: Repository<FeatureRequestComment>,
  ) {}

  async addFeatureRequest(
    userId: string,
    orgId: string,
    createFeatureRequestDto: CreateFeatureRequestDto,
  ): Promise<FeatureRequestDto> {
    const org = await this.orgsRepository.findOneByOrFail({ id: orgId });
    if (org.paymentPlan !== PaymentPlan.PREMIUM) {
      throw new Error(
        'You need to upgrade your plan to create a feature request',
      );
    }

    const user = await this.usersRepository.findOneByOrFail({ id: userId });
    const featureRequest = new FeatureRequest();
    featureRequest.title = createFeatureRequestDto.title;
    featureRequest.description = createFeatureRequestDto.description;
    featureRequest.createdBy = Promise.resolve(user);
    featureRequest.org = Promise.resolve(org);
    featureRequest.votesCount = 1;
    const savedFeatureRequest =
      await this.featureRequestsRepository.save(featureRequest);

    const featureRequestVote = new FeatureRequestVote();
    featureRequestVote.user = Promise.resolve(user);
    featureRequestVote.featureRequest = Promise.resolve(savedFeatureRequest);
    featureRequestVote.vote = 1;
    await this.featureRequestVotesRepository.save(featureRequestVote);

    return await FeatureRequestsMapper.toFeatureRequestDto(savedFeatureRequest);
  }

  async listFeatureRequests(
    orgId: string,
    page: number = 1,
    limit: number = 0,
  ) {
    const org = await this.orgsRepository.findOneByOrFail({ id: orgId });

    if (org.paymentPlan !== PaymentPlan.PREMIUM) {
      throw new Error('You need to upgrade your plan to view feature requests');
    }

    const featureRequests = await this.featureRequestsRepository.find({
      where: { org: { id: orgId } },
      take: limit,
      skip: (page - 1) * limit,
      order: { votesCount: 'DESC', createdAt: 'DESC' },
    });

    return Promise.all(
      featureRequests.map(FeatureRequestsMapper.toFeatureRequestDto),
    );
  }

  async getFeatureRequestById(
    orgId: string,
    featureRequestId: string,
  ): Promise<FeatureRequestDto> {
    const org = await this.orgsRepository.findOneByOrFail({ id: orgId });

    if (org.paymentPlan !== PaymentPlan.PREMIUM) {
      throw new Error('You need to upgrade your plan to view feature requests');
    }

    const featureRequest = await this.featureRequestsRepository.findOneOrFail({
      where: {
        id: featureRequestId,
        org: { id: orgId },
      },
    });
    return await FeatureRequestsMapper.toFeatureRequestDto(featureRequest);
  }

  async updateFeatureRequest(
    userId: string,
    orgId: string,
    featureRequestId: string,
    updateFeatureRequestDto: UpdateFeatureRequestDto,
  ): Promise<FeatureRequestDto> {
    const org = await this.orgsRepository.findOneByOrFail({ id: orgId });
    if (org.paymentPlan !== PaymentPlan.PREMIUM) {
      throw new Error(
        'You need to upgrade your plan to update a feature request',
      );
    }

    const featureRequest = await this.featureRequestsRepository.findOneOrFail({
      where: {
        id: featureRequestId,
        org: { id: orgId },
      },
    });

    const user = await this.usersRepository.findOneByOrFail({ id: userId });
    const featureRequestOrg = await featureRequest.org;
    const userOrg = await user.org;
    if (featureRequestOrg.id !== userOrg.id) {
      throw new Error('You are not allowed to update this feature request');
    }

    featureRequest.title = updateFeatureRequestDto.title;
    featureRequest.description = updateFeatureRequestDto.description;
    featureRequest.status = updateFeatureRequestDto.status;
    featureRequest.estimation = updateFeatureRequestDto.estimation;

    if (featureRequest.status === FeatureRequestStatus.COMPLETED) {
      featureRequest.completedAt = new Date();
    }

    const savedFeature =
      await this.featureRequestsRepository.save(featureRequest);
    return await FeatureRequestsMapper.toFeatureRequestDto(savedFeature);
  }

  async deleteFeatureRequest(
    userId: string,
    orgId: string,
    featureRequestId: string,
  ) {
    const org = await this.orgsRepository.findOneByOrFail({ id: orgId });
    if (org.paymentPlan !== PaymentPlan.PREMIUM) {
      throw new Error(
        'You need to upgrade your plan to delete a feature request',
      );
    }

    const featureRequest = await this.featureRequestsRepository.findOneOrFail({
      where: {
        id: featureRequestId,
        org: { id: orgId },
      },
    });

    const user = await this.usersRepository.findOneByOrFail({ id: userId });
    const featureRequestOrg = await featureRequest.org;
    const userOrg = await user.org;
    if (featureRequestOrg.id !== userOrg.id) {
      throw new Error('You are not allowed to delete this feature request');
    }

    await this.featureRequestsRepository.remove(featureRequest);
  }

  async createFeatureRequestComment(
    userId: string,
    featureRequestId: string,
    createCommentDto: CreateUpdateCommentDto,
  ) {
    const user = await this.usersRepository.findOneByOrFail({ id: userId });
    const featureRequest = await this.featureRequestsRepository.findOneByOrFail(
      {
        id: featureRequestId,
      },
    );
    const org = await featureRequest.org;
    if (org.paymentPlan !== PaymentPlan.PREMIUM) {
      throw new Error('You need to upgrade to premium to add comments');
    }
    if (!createCommentDto.content || createCommentDto.content.trim() === '') {
      throw new Error('Comment content is required');
    }
    const comment = new FeatureRequestComment();
    comment.content = createCommentDto.content;
    comment.createdBy = Promise.resolve(user);
    comment.org = Promise.resolve(org);
    comment.featureRequest = Promise.resolve(featureRequest);
    const savedComment =
      await this.featureRequestCommentsRepository.save(comment);
    return CommentMapper.toDto(savedComment);
  }

  async deleteFeatureRequestComment(
    userId: string,
    featureRequestId: string,
    commentId: string,
  ) {
    const comment = await this.featureRequestCommentsRepository.findOneByOrFail(
      {
        id: commentId,
        featureRequest: { id: featureRequestId },
        createdBy: { id: userId },
      },
    );
    await this.featureRequestCommentsRepository.remove(comment);
  }

  async updateFeatureRequestComment(
    userId: string,
    featureRequestId: string,
    commentId: string,
    createCommentDto: CreateUpdateCommentDto,
  ) {
    const featureRequest = await this.featureRequestsRepository.findOneByOrFail(
      {
        id: featureRequestId,
      },
    );
    const org = await featureRequest.org;
    if (org.paymentPlan !== PaymentPlan.PREMIUM) {
      throw new Error('You need to upgrade to premium to add comments');
    }
    if (!createCommentDto.content || createCommentDto.content.trim() === '') {
      throw new Error('Comment content is required');
    }
    const comment = await this.featureRequestCommentsRepository.findOneByOrFail(
      {
        id: commentId,
        featureRequest: { id: featureRequestId },
        createdBy: { id: userId },
      },
    );
    comment.content = createCommentDto.content;
    const savedComment =
      await this.featureRequestCommentsRepository.save(comment);
    return await CommentMapper.toDto(savedComment);
  }
}
