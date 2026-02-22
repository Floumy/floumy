import { Injectable } from '@nestjs/common';
import { CreateRequestDto, RequestDto, UpdateRequestDto } from './dtos';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from './request.entity';
import { In, Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { Org } from '../orgs/org.entity';
import { RequestsMapper } from './requests.mapper';
import { RequestStatus } from './request-status.enum';
import { RequestVote } from './request-vote.entity';
import { CommentMapper } from '../comments/mappers';
import { CreateUpdateCommentDto } from '../comments/dtos';
import { RequestComment } from './request-comment.entity';
import { Project } from '../projects/project.entity';
import { Initiative } from '../roadmap/initiatives/initiative.entity';
import { CreateNotificationDto } from '../notifications/dtos';
import {
  ActionType,
  EntityType,
  StatusType,
} from '../notifications/notification.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(Request)
    private requestsRepository: Repository<Request>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Org)
    private orgsRepository: Repository<Org>,
    @InjectRepository(RequestVote)
    private requestVotesRepository: Repository<RequestVote>,
    @InjectRepository(RequestComment)
    private requestCommentsRepository: Repository<RequestComment>,
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
    @InjectRepository(Initiative)
    private initiativesRepository: Repository<Initiative>,
    private eventEmitter: EventEmitter2,
  ) {}

  async addRequest(
    userId: string,
    orgId: string,
    projectId: string,
    createRequestDto: CreateRequestDto,
  ): Promise<RequestDto> {
    const org = await this.orgsRepository.findOneByOrFail({ id: orgId });
    const user = await this.usersRepository.findOneByOrFail({ id: userId });
    const request = new Request();
    request.title = createRequestDto.title;
    request.description = createRequestDto.description;
    request.createdBy = Promise.resolve(user);
    request.org = Promise.resolve(org);
    request.votesCount = 1;
    const project = await this.projectsRepository.findOneByOrFail({
      id: projectId,
      org: { id: orgId },
    });
    request.project = Promise.resolve(project);
    const savedRequest = await this.requestsRepository.save(request);

    const requestVote = new RequestVote();
    requestVote.user = Promise.resolve(user);
    requestVote.request = Promise.resolve(savedRequest);
    requestVote.vote = 1;
    await this.requestVotesRepository.save(requestVote);

    const requestDto = await RequestsMapper.toRequestDto(savedRequest);
    this.eventEmitter.emit('request.created', requestDto);
    return requestDto;
  }

  async listRequests(
    orgId: string,
    projectId: string,
    page: number = 1,
    limit: number = 0,
  ) {
    const requests = await this.requestsRepository.find({
      where: { org: { id: orgId }, project: { id: projectId } },
      take: limit,
      skip: (page - 1) * limit,
      order: { votesCount: 'DESC', createdAt: 'DESC' },
    });

    return RequestsMapper.toListDto(requests);
  }

  async getRequestById(
    orgId: string,
    projectId: string,
    requestId: string,
  ): Promise<RequestDto> {
    const request = await this.requestsRepository.findOneOrFail({
      where: {
        id: requestId,
        org: { id: orgId },
        project: { id: projectId },
      },
    });
    return await RequestsMapper.toRequestDto(request);
  }

  async updateRequest(
    userId: string,
    orgId: string,
    projectId: string,
    requestId: string,
    updateRequestDto: UpdateRequestDto,
  ): Promise<RequestDto> {
    const request = await this.requestsRepository.findOneOrFail({
      where: {
        id: requestId,
        org: { id: orgId },
        project: { id: projectId },
      },
    });
    const previousRequestDto = await RequestsMapper.toRequestDto(request);
    const user = await this.usersRepository.findOneByOrFail({ id: userId });
    const requestOrg = await request.org;
    const userOrg = await user.org;
    if (requestOrg.id !== userOrg.id) {
      throw new Error('You are not allowed to update this request');
    }

    request.title = updateRequestDto.title;
    request.description = updateRequestDto.description;
    request.status = updateRequestDto.status;
    request.estimation = updateRequestDto.estimation;

    if (request.status === RequestStatus.COMPLETED) {
      request.completedAt = new Date();
    }

    const savedRequest = await this.requestsRepository.save(request);
    const requestDto = await RequestsMapper.toRequestDto(savedRequest);
    this.eventEmitter.emit('request.updated', {
      previous: previousRequestDto,
      current: requestDto,
    });
    return requestDto;
  }

  async deleteRequest(
    userId: string,
    orgId: string,
    projectId: string,
    requestId: string,
  ) {
    const request = await this.requestsRepository.findOneOrFail({
      where: {
        id: requestId,
        org: { id: orgId },
        project: { id: projectId },
      },
    });

    const requestDto = await RequestsMapper.toRequestDto(request);

    const user = await this.usersRepository.findOneByOrFail({ id: userId });
    const requestOrg = await request.org;
    const userOrg = await user.org;
    if (requestOrg.id !== userOrg.id) {
      throw new Error('You are not allowed to delete this request');
    }

    const initiatives = await request.initiatives;
    for (const initiative of initiatives) {
      await this.initiativesRepository.update(initiative.id, {
        requestId: null,
      } as any);
    }

    await this.requestsRepository.remove(request);
    this.eventEmitter.emit('request.deleted', requestDto);
  }

  async createRequestComment(
    orgId: string,
    projectId: string,
    userId: string,
    requestId: string,
    createCommentDto: CreateUpdateCommentDto,
  ) {
    const user = await this.usersRepository.findOneByOrFail({ id: userId });
    const request = await this.requestsRepository.findOneByOrFail({
      id: requestId,
      org: { id: orgId },
      project: { id: projectId },
    });
    const org = await request.org;
    if (!createCommentDto.content || createCommentDto.content.trim() === '') {
      throw new Error('Comment content is required');
    }
    const comment = new RequestComment();
    comment.content = createCommentDto.content;
    comment.createdBy = Promise.resolve(user);
    comment.org = Promise.resolve(org);
    comment.request = Promise.resolve(request);
    comment.mentions = Promise.resolve(
      await this.usersRepository.findBy({
        id: In(createCommentDto.mentions),
      }),
    );
    const savedComment = await this.requestCommentsRepository.save(comment);
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
        entity: EntityType.REQUEST_COMMENT,
        status: StatusType.UNREAD,
        entityId: savedComment.id,
      };
      this.eventEmitter.emit('mention.created', notification);
    }
    return CommentMapper.toDto(savedComment);
  }

  async deleteRequestComment(
    orgId: string,
    userId: string,
    requestId: string,
    commentId: string,
  ) {
    const comment = await this.requestCommentsRepository.findOneByOrFail({
      id: commentId,
      request: { id: requestId },
      createdBy: { id: userId },
      org: { id: orgId },
    });
    await this.requestCommentsRepository.remove(comment);
  }

  async updateRequestComment(
    orgId: string,
    projectId: string,
    userId: string,
    requestId: string,
    commentId: string,
    createCommentDto: CreateUpdateCommentDto,
  ) {
    const request = await this.requestsRepository.findOneOrFail({
      where: {
        id: requestId,
        org: { id: orgId },
        project: { id: projectId },
      },
    });
    const org = await request.org;
    if (!createCommentDto.content || createCommentDto.content.trim() === '') {
      throw new Error('Comment content is required');
    }
    const comment = await this.requestCommentsRepository.findOneByOrFail({
      id: commentId,
      request: { id: requestId },
      createdBy: { id: userId },
    });
    comment.content = createCommentDto.content;
    comment.mentions = Promise.resolve(
      await this.usersRepository.findBy({
        id: In(createCommentDto.mentions),
      }),
    );
    const savedComment = await this.requestCommentsRepository.save(comment);
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
        entity: EntityType.REQUEST_COMMENT,
        status: StatusType.UNREAD,
        entityId: savedComment.id,
      };
      this.eventEmitter.emit('mention.created', notification);
    }
    return await CommentMapper.toDto(savedComment);
  }

  async searchRequestsByTitleOrDescription(
    orgId: string,
    projectId: string,
    search: string,
    page: number,
    limit: number,
  ) {
    let query = `
            SELECT *
            FROM request
            WHERE request."orgId" = $1
              AND request."projectId" = $2
              AND (request.title ILIKE $3 OR request.description ILIKE $3)
            ORDER BY request."votesCount" DESC,
                     request."createdAt" DESC
        `;
    let params = [orgId, projectId, `%${search}%`] as any[];

    if (limit > 0) {
      query += ' OFFSET $4 LIMIT $5';
      const offset = (page - 1) * limit;
      params = [orgId, projectId, `%${search}%`, offset, limit];
    }

    const workItems = await this.requestsRepository.query(query, params);

    return RequestsMapper.toListDto(workItems);
  }
}
