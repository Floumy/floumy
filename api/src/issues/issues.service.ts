import { Injectable } from '@nestjs/common';
import { IssueDto, UpdateIssueDto } from './dtos';
import { In, Repository } from 'typeorm';
import { Org } from '../orgs/org.entity';
import { Issue } from './issue.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { IssueListItemMapper, IssueMapper } from './issue.mapper';
import { CreateUpdateCommentDto } from '../comments/dtos';
import { IssueComment } from './issue-comment.entity';
import { CommentMapper } from '../comments/mappers';
import { Project } from '../projects/project.entity';
import { WorkItem } from '../backlog/work-items/work-item.entity';
import { CreateNotificationDto } from '../notifications/dtos';
import {
  ActionType,
  EntityType,
  StatusType,
} from '../notifications/notification.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class IssuesService {
  constructor(
    @InjectRepository(Org)
    private orgsRepository: Repository<Org>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Issue)
    private issuesRepository: Repository<Issue>,
    @InjectRepository(IssueComment)
    private issueCommentsRepository: Repository<IssueComment>,
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
    @InjectRepository(WorkItem)
    private workItemsRepository: Repository<WorkItem>,
    private eventEmitter: EventEmitter2,
  ) {}

  async addIssue(
    userId: string,
    orgId: string,
    projectId: string,
    issueDto: IssueDto,
  ) {
    const org = await this.orgsRepository.findOneByOrFail({ id: orgId });
    const project = await this.projectsRepository.findOneByOrFail({
      id: projectId,
      org: { id: orgId },
    });
    const user = await this.usersRepository.findOneByOrFail({ id: userId });
    const issue = new Issue();
    issue.title = issueDto.title;
    issue.description = issueDto.description;
    issue.org = Promise.resolve(org);
    issue.project = Promise.resolve(project);
    issue.createdBy = Promise.resolve(user);
    const savedIssue = await this.issuesRepository.save(issue);
    const savedIssueDto = await IssueMapper.toDto(savedIssue);
    this.eventEmitter.emit('issue.created', savedIssueDto);
    return savedIssueDto;
  }

  async listIssues(
    orgId: string,
    projectId: string,
    page: number = 1,
    limit: number = 0,
  ) {
    let query = `
        SELECT *
        FROM issue
        WHERE issue."orgId" = $1
          AND issue."projectId" = $2
        ORDER BY CASE
                     WHEN issue."priority" = 'high' THEN 1
                     WHEN issue."priority" = 'medium' THEN 2
                     WHEN issue."priority" = 'low' THEN 3
                     ELSE 4
                     END,
                 issue."createdAt" DESC
    `;
    let params = [orgId, projectId] as any[];
    if (limit > 0) {
      query += ' OFFSET $3 LIMIT $4';
      const offset = (page - 1) * limit;
      params = [orgId, projectId, offset, limit];
    }

    const issues = await this.issuesRepository.query(query, params);
    return await Promise.all(issues.map(IssueListItemMapper.toListItemDto));
  }

  async getIssueById(orgId: string, projectId: string, issueId: string) {
    const issue = await this.issuesRepository.findOneByOrFail({
      id: issueId,
      org: { id: orgId },
      project: { id: projectId },
    });
    return await IssueMapper.toDto(issue);
  }

  async updateIssue(
    userId: string,
    orgId: string,
    projectId: string,
    issueId: any,
    issueDto: UpdateIssueDto,
  ) {
    const issue = await this.issuesRepository.findOneByOrFail({
      id: issueId,
      org: { id: orgId },
      project: { id: projectId },
    });
    const previousIssueDto = await IssueMapper.toDto(issue);
    const user = await this.usersRepository.findOneByOrFail({ id: userId });
    const createdBy = await issue.createdBy;
    const userOrg = await user.org;
    if (createdBy.id !== userId || orgId !== userOrg.id) {
      throw new Error('You are not allowed to update this issue');
    }
    issue.title = issueDto.title;
    issue.description = issueDto.description;
    issue.status = issueDto.status;
    issue.priority = issueDto.priority;
    const savedIssue = await this.issuesRepository.save(issue);
    const savedIssueDto = await IssueMapper.toDto(savedIssue);
    this.eventEmitter.emit('issue.updated', {
      previous: previousIssueDto,
      current: savedIssueDto,
    });
    return savedIssueDto;
  }

  async deleteIssue(
    userId: string,
    orgId: string,
    projectId: string,
    issueId: string,
  ) {
    const issue = await this.issuesRepository.findOneByOrFail({
      id: issueId,
      org: { id: orgId },
      project: { id: projectId },
    });
    const issueDto = await IssueMapper.toDto(issue);
    const user = await this.usersRepository.findOneByOrFail({ id: userId });
    const createdBy = await issue.createdBy;
    const userOrg = await user.org;
    if (createdBy.id !== userId || orgId !== userOrg.id) {
      throw new Error('You are not allowed to delete this issue');
    }

    // Remove the issue from the work items
    const workItems = await issue.workItems;
    for (const workItem of workItems) {
      workItem.issue = null;
      await this.workItemsRepository.save(workItem);
    }

    await this.issuesRepository.remove(issue);
    this.eventEmitter.emit('issue.deleted', issueDto);
  }

  async createIssueComment(
    userId: string,
    issueId: string,
    createCommentDto: CreateUpdateCommentDto,
  ) {
    const user = await this.usersRepository.findOneByOrFail({ id: userId });
    const issue = await this.issuesRepository.findOneByOrFail({
      id: issueId,
    });
    const org = await issue.org;
    if (!createCommentDto.content || createCommentDto.content.trim() === '') {
      throw new Error('Comment content is required');
    }
    const comment = new IssueComment();
    comment.content = createCommentDto.content;
    comment.createdBy = Promise.resolve(user);
    comment.org = Promise.resolve(org);
    comment.issue = Promise.resolve(issue);
    comment.mentions = Promise.resolve(
      await this.usersRepository.findBy({
        id: In(createCommentDto.mentions),
      }),
    );
    const savedComment = await this.issueCommentsRepository.save(comment);
    const mentions = await savedComment.mentions;
    if (mentions.length > 0) {
      const notification: CreateNotificationDto = {
        mentions,
        createdBy: user,
        org: org,
        project: await issue.project,
        action: ActionType.CREATE,
        entity: EntityType.ISSUE_COMMENT,
        status: StatusType.UNREAD,
        entityId: savedComment.id,
      };
      this.eventEmitter.emit('mention.created', notification);
    }
    return CommentMapper.toDto(savedComment);
  }

  async deleteIssueComment(userId: string, issueId: string, commentId: string) {
    const comment = await this.issueCommentsRepository.findOneByOrFail({
      id: commentId,
      issue: { id: issueId },
      createdBy: { id: userId },
    });
    await this.issueCommentsRepository.remove(comment);
  }

  async updateIssueComment(
    userId: string,
    issueId: string,
    commentId: string,
    updateCommentDto: CreateUpdateCommentDto,
  ) {
    const issue = await this.issuesRepository.findOneByOrFail({
      id: issueId,
    });
    const org = await issue.org;
    if (!updateCommentDto.content || updateCommentDto.content.trim() === '') {
      throw new Error('Comment content is required');
    }
    const comment = await this.issueCommentsRepository.findOneByOrFail({
      id: commentId,
      issue: { id: issueId },
      createdBy: { id: userId },
    });
    comment.content = updateCommentDto.content;
    comment.mentions = Promise.resolve(
      await this.usersRepository.findBy({
        id: In(updateCommentDto.mentions),
      }),
    );
    const savedComment = await this.issueCommentsRepository.save(comment);
    const mentions = await savedComment.mentions;
    if (mentions.length > 0) {
      const notification: CreateNotificationDto = {
        mentions,
        createdBy: await this.usersRepository.findOneByOrFail({ id: userId }),
        org: org,
        project: await issue.project,
        action: ActionType.UPDATE,
        entity: EntityType.ISSUE_COMMENT,
        status: StatusType.UNREAD,
        entityId: savedComment.id,
      };
      this.eventEmitter.emit('mention.created', notification);
    }
    return await CommentMapper.toDto(savedComment);
  }

  async searchIssues(
    orgId: string,
    projectId: string,
    search: string,
    page: number = 1,
    limit: number = 0,
  ) {
    let query = `
        SELECT *
        FROM issue
        WHERE issue."orgId" = $1
          AND issue."projectId" = $2
          AND (issue.title ILIKE $3 OR issue.description ILIKE $3)
        ORDER BY CASE
                     WHEN issue."priority" = 'high' THEN 1
                     WHEN issue."priority" = 'medium' THEN 2
                     WHEN issue."priority" = 'low' THEN 3
                     ELSE 4
                     END,
                 issue."createdAt" DESC
    `;
    let params = [orgId, projectId, `%${search}%`] as any[];

    if (limit > 0) {
      query += ' OFFSET $4 LIMIT $5';
      const offset = (page - 1) * limit;
      params = [orgId, projectId, `%${search}%`, offset, limit];
    }
    const issues = await this.issuesRepository.query(query, params);
    return await Promise.all(issues.map(IssueListItemMapper.toListItemDto));
  }
}
