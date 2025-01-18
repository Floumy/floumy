import { Injectable } from '@nestjs/common';
import {
  CreateFeatureRequestDto,
  FeatureRequestDto,
  UpdateFeatureRequestDto,
} from './dtos';
import { InjectRepository } from '@nestjs/typeorm';
import { FeatureRequest } from './feature-request.entity';
import { In, Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { Org } from '../orgs/org.entity';
import { PaymentPlan } from '../auth/payment.plan';
import { FeatureRequestsMapper } from './feature-requests.mapper';
import { FeatureRequestStatus } from './feature-request-status.enum';
import { FeatureRequestVote } from './feature-request-vote.entity';
import { CommentMapper } from '../comments/mappers';
import { CreateUpdateCommentDto } from '../comments/dtos';
import { FeatureRequestComment } from './feature-request-comment.entity';
import { Project } from '../projects/project.entity';
import { Feature } from '../roadmap/features/feature.entity';
import { CreateNotificationDto } from '../notifications/dtos';
import {
  ActionType,
  EntityType,
  StatusType,
} from '../notifications/notification.entity';
import {EventEmitter2} from "@nestjs/event-emitter";

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
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
    @InjectRepository(Feature)
    private featuresRepository: Repository<Feature>,
    private eventEmitter: EventEmitter2,
  ) {}

  async addFeatureRequest(
    userId: string,
    orgId: string,
    projectId: string,
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
    const project = await this.projectsRepository.findOneByOrFail({
      id: projectId,
      org: { id: orgId },
    });
    featureRequest.project = Promise.resolve(project);
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
    projectId: string,
    page: number = 1,
    limit: number = 0,
  ) {
    const org = await this.orgsRepository.findOneByOrFail({ id: orgId });

    if (org.paymentPlan !== PaymentPlan.PREMIUM) {
      throw new Error('You need to upgrade your plan to view feature requests');
    }

    const featureRequests = await this.featureRequestsRepository.find({
      where: { org: { id: orgId }, project: { id: projectId } },
      take: limit,
      skip: (page - 1) * limit,
      order: { votesCount: 'DESC', createdAt: 'DESC' },
    });

    return FeatureRequestsMapper.toListDto(featureRequests);
  }

  async getFeatureRequestById(
    orgId: string,
    projectId: string,
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
        project: { id: projectId },
      },
    });
    return await FeatureRequestsMapper.toFeatureRequestDto(featureRequest);
  }

  async updateFeatureRequest(
    userId: string,
    orgId: string,
    projectId: string,
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
        project: { id: projectId },
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
    projectId: string,
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
        project: { id: projectId },
      },
    });

    const user = await this.usersRepository.findOneByOrFail({ id: userId });
    const featureRequestOrg = await featureRequest.org;
    const userOrg = await user.org;
    if (featureRequestOrg.id !== userOrg.id) {
      throw new Error('You are not allowed to delete this feature request');
    }

    // Remove the feature request from the features
    const features = await featureRequest.features;
    for (const feature of features) {
      feature.featureRequest = null;
      await this.featuresRepository.save(feature);
    }

    await this.featureRequestsRepository.remove(featureRequest);
  }

  async createFeatureRequestComment(
    orgId: string,
    projectId: string,
    userId: string,
    featureRequestId: string,
    createCommentDto: CreateUpdateCommentDto,
  ) {
    const user = await this.usersRepository.findOneByOrFail({ id: userId });
    const featureRequest = await this.featureRequestsRepository.findOneByOrFail(
      {
        id: featureRequestId,
        org: { id: orgId },
        project: { id: projectId },
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
    comment.mentions = Promise.resolve(
      await this.usersRepository.findBy({
        id: In(createCommentDto.mentions),
      }),
    );
    const savedComment =
      await this.featureRequestCommentsRepository.save(comment);
    const mentions = await savedComment.mentions;
    if (mentions.length > 0) {
      const notification: CreateNotificationDto = {
        mentions,
        createdBy: user,
        org: await savedComment.org,
        project: await this.projectsRepository.findOneByOrFail({
          id: projectId,
        }),
        action: ActionType.CREATE,
        entity: EntityType.FEATURE_REQUEST_COMMENT,
        status: StatusType.UNREAD,
        entityId: savedComment.id,
      };
      this.eventEmitter.emit('mention.created', notification);
    }
    return CommentMapper.toDto(savedComment);
  }

  async deleteFeatureRequestComment(
    orgId: string,
    userId: string,
    featureRequestId: string,
    commentId: string,
  ) {
    const comment = await this.featureRequestCommentsRepository.findOneByOrFail(
      {
        id: commentId,
        featureRequest: { id: featureRequestId },
        createdBy: { id: userId },
        org: { id: orgId },
      },
    );
    await this.featureRequestCommentsRepository.remove(comment);
  }

  async updateFeatureRequestComment(
    orgId: string,
    projectId: string,
    userId: string,
    featureRequestId: string,
    commentId: string,
    createCommentDto: CreateUpdateCommentDto,
  ) {
    const featureRequest = await this.featureRequestsRepository.findOneByOrFail(
      {
        id: featureRequestId,
        org: { id: orgId },
        project: { id: projectId },
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
    comment.mentions = Promise.resolve(
      await this.usersRepository.findBy({
        id: In(createCommentDto.mentions),
      }),
    );
    const savedComment =
      await this.featureRequestCommentsRepository.save(comment);
    const mentions = await savedComment.mentions;
    if (mentions.length > 0) {
      const notification: CreateNotificationDto = {
        mentions,
        createdBy: await this.usersRepository.findOneByOrFail({ id: userId }),
        org: org,
        project: await this.projectsRepository.findOneByOrFail({
          id: projectId,
        }),
        action: ActionType.UPDATE,
        entity: EntityType.FEATURE_REQUEST_COMMENT,
        status: StatusType.UNREAD,
        entityId: savedComment.id,
      };
      this.eventEmitter.emit('mention.created', notification);
    }
    return await CommentMapper.toDto(savedComment);
  }

  async searchFeatureRequestsByTitleOrDescription(
    orgId: string,
    projectId: string,
    search: string,
    page: number,
    limit: number,
  ) {
    let query = `
            SELECT *
            FROM feature_request
            WHERE feature_request."orgId" = $1
              AND feature_request."projectId" = $2
              AND (feature_request.title ILIKE $3 OR feature_request.description ILIKE $3)
            ORDER BY feature_request."votesCount" DESC,
                     feature_request."createdAt" DESC
        `;
    let params = [orgId, projectId, `%${search}%`] as any[];

    if (limit > 0) {
      query += ' OFFSET $4 LIMIT $5';
      const offset = (page - 1) * limit;
      params = [orgId, projectId, `%${search}%`, offset, limit];
    }

    const workItems = await this.featureRequestsRepository.query(query, params);

    return FeatureRequestsMapper.toListDto(workItems);
  }
}
