import { Injectable } from '@nestjs/common';
import { CreateUpdateWorkItemDto, WorkItemPatchDto } from './dtos';
import { InjectRepository } from '@nestjs/typeorm';
import { Initiative } from '../../roadmap/initiatives/initiative.entity';
import { In, Repository } from 'typeorm';
import { WorkItem } from './work-item.entity';
import WorkItemMapper from './work-item.mapper';
import { WorkItemStatus } from './work-item-status.enum';
import { Sprint } from '../../sprints/sprint.entity';
import { File } from '../../files/file.entity';
import { WorkItemFile } from './work-item-file.entity';
import { User } from '../../users/user.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FilesService } from '../../files/files.service';
import { CommentMapper } from '../../comments/mappers';
import { CreateUpdateCommentDto } from '../../comments/dtos';
import { PaymentPlan } from '../../auth/payment.plan';
import { WorkItemComment } from './work-item-comment.entity';
import { Issue } from '../../issues/issue.entity';
import { Project } from '../../projects/project.entity';
import { FilterOptions, WorkItemQueryBuilder } from './work-item.query-builder';
import { CreateNotificationDto } from '../../notifications/dtos';
import {
  ActionType,
  EntityType,
  StatusType,
} from '../../notifications/notification.entity';

@Injectable()
export class WorkItemsService {
  constructor(
    @InjectRepository(WorkItem)
    private workItemsRepository: Repository<WorkItem>,
    @InjectRepository(Initiative) private initiativeRepository: Repository<Initiative>,
    @InjectRepository(Sprint)
    private sprintRepository: Repository<Sprint>,
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(File) private filesRepository: Repository<File>,
    @InjectRepository(WorkItemFile)
    private workItemFilesRepository: Repository<WorkItemFile>,
    @InjectRepository(WorkItemComment)
    private workItemCommentsRepository: Repository<WorkItemComment>,
    private filesService: FilesService,
    private eventEmitter: EventEmitter2,
    @InjectRepository(Issue) private issuesRepository: Repository<Issue>,
    @InjectRepository(Project) private projectsRepository: Repository<Project>,
  ) {}

  async createWorkItem(
    orgId: string,
    projectId: string,
    userId: string,
    workItemDto: CreateUpdateWorkItemDto,
  ) {
    if (!userId) throw new Error('User id is required');
    const user = await this.usersRepository.findOneByOrFail({ id: userId });
    const project = await this.projectsRepository.findOneByOrFail({
      id: projectId,
      org: { id: orgId },
    });
    const org = await user.org;
    const workItem = new WorkItem();
    workItem.createdBy = Promise.resolve(user);
    workItem.project = Promise.resolve(project);
    await this.setWorkItemData(workItem, workItemDto, org.id);
    workItem.org = Promise.resolve(org);
    await this.workItemsRepository.save(workItem);
    const savedWorkItem = await this.workItemsRepository.findOneByOrFail({
      id: workItem.id,
    });
    const savedMentions = await savedWorkItem.mentions;
    if (savedMentions.length > 0) {
      const notification: CreateNotificationDto = {
        mentions: savedMentions,
        createdBy: user,
        org: org,
        project: project,
        action: ActionType.CREATE,
        entity: EntityType.WORK_ITEM_DESCRIPTION,
        status: StatusType.UNREAD,
        entityId: savedWorkItem.id,
      };
      this.eventEmitter.emit('mention.created', notification);
    }
    const initiative = await savedWorkItem.initiative;
    await this.updateInitiativeProgress(initiative);
    await this.setWorkItemsFiles(workItem, workItemDto, savedWorkItem);
    this.eventEmitter.emit(
      'workItem.created',
      await WorkItemMapper.toDto(savedWorkItem),
    );
    return WorkItemMapper.toDto(savedWorkItem);
  }

  async listWorkItems(
    orgId: string,
    projectId: string,
    page: number = 1,
    limit: number = 0,
  ) {
    let query = `
            SELECT *
            FROM work_item
            WHERE work_item."orgId" = $1
              AND work_item."projectId" = $2
            ORDER BY CASE
                         WHEN work_item."priority" = 'high' THEN 1
                         WHEN work_item."priority" = 'medium' THEN 2
                         WHEN work_item."priority" = 'low' THEN 3
                         ELSE 4
                         END,
                     work_item."createdAt" DESC
        `;
    let params = [orgId, projectId] as any[];
    if (limit > 0) {
      query += ' OFFSET $3 LIMIT $4';
      const offset = (page - 1) * limit;
      params = [orgId, projectId, offset, limit];
    }

    const workItems = await this.workItemsRepository.query(query, params);
    return WorkItemMapper.toSimpleListDto(workItems);
  }

  async getWorkItem(orgId: string, projectId: string, id: string) {
    const workItem = await this.workItemsRepository.findOneByOrFail({
      id,
      org: { id: orgId },
      project: { id: projectId },
    });
    return WorkItemMapper.toDto(workItem);
  }

  async updateWorkItem(
    userId: string,
    orgId: string,
    projectId: string,
    id: string,
    workItemDto: CreateUpdateWorkItemDto,
  ) {
    const workItem = await this.workItemsRepository.findOneByOrFail({
      id,
      org: { id: orgId },
      project: { id: projectId },
    });
    const previous = await WorkItemMapper.toDto(workItem);
    const oldFeature = await workItem.initiative;
    await this.setWorkItemData(workItem, workItemDto, orgId);
    const savedWorkItem = await this.workItemsRepository.save(workItem);
    const savedMentions = await savedWorkItem.mentions;
    if (savedMentions && savedMentions.length > 0) {
      const notification: CreateNotificationDto = {
        mentions: savedMentions,
        createdBy: await this.usersRepository.findOneByOrFail({ id: userId }),
        org: await workItem.org,
        project: await workItem.project,
        action: ActionType.UPDATE,
        entity: EntityType.WORK_ITEM_DESCRIPTION,
        status: StatusType.UNREAD,
        entityId: savedWorkItem.id,
      };
      this.eventEmitter.emit('mention.created', notification);
    }
    const newFeature = await savedWorkItem.initiative;
    await this.updateInitiativeProgress(oldFeature);
    if (newFeature && (!oldFeature || oldFeature.id !== newFeature.id)) {
      await this.updateInitiativeProgress(newFeature);
    }
    await this.setWorkItemsFiles(workItem, workItemDto, savedWorkItem);
    const current = await WorkItemMapper.toDto(savedWorkItem);
    this.eventEmitter.emit('workItem.updated', {
      previous,
      current,
    });
    return current;
  }

  async deleteWorkItem(orgId: string, projectId: string, id: string) {
    const workItem = await this.workItemsRepository.findOneByOrFail({
      id,
      org: { id: orgId },
      project: { id: projectId },
    });
    const deletedWorkItem = await WorkItemMapper.toDto(workItem);
    await this.deleteWorkItemFiles(orgId, projectId, workItem.id);

    const initiative = await workItem.initiative;

    await this.workItemsRepository.remove(workItem);

    if (initiative) {
      await this.updateInitiativeProgress(initiative);
    }
    this.eventEmitter.emit('workItem.deleted', deletedWorkItem);
  }

  removeInitiativeFromWorkItems(orgId: string, projectId: string, id: string) {
    return this.workItemsRepository.update(
      { org: { id: orgId }, initiative: { id }, project: { id: projectId } },
      { initiative: null },
    );
  }

  async listOpenWorkItemsWithoutSprints(orgId: string, projectId: string) {
    const workItems = await this.workItemsRepository
      .createQueryBuilder('workItem')
      .leftJoinAndSelect('workItem.initiative', 'initiative')
      .leftJoinAndSelect('workItem.assignedTo', 'assignedTo')
      .where('workItem.orgId = :orgId', { orgId })
      .andWhere('workItem.projectId = :projectId', { projectId })
      .andWhere('workItem.status NOT IN (:closedStatus, :doneStatus)', {
        closedStatus: WorkItemStatus.CLOSED,
        doneStatus: WorkItemStatus.DONE,
      })
      .andWhere('workItem.sprintId IS NULL')
      .getMany();
    return await WorkItemMapper.toListDto(workItems);
  }

  async patchWorkItem(
    orgId: string,
    projectId: string,
    workItemId: string,
    workItemPatchDto: WorkItemPatchDto,
  ) {
    const workItem = await this.workItemsRepository.findOneByOrFail({
      id: workItemId,
      org: { id: orgId },
      project: { id: projectId },
    });
    const previous = await WorkItemMapper.toDto(workItem);
    const currentSprint = await workItem.sprint;

    await this.updateSprint(
      workItem,
      workItemPatchDto,
      orgId,
      currentSprint,
    );
    this.updateStatusAndCompletionDate(workItem, workItemPatchDto);
    this.updatePriority(workItem, workItemPatchDto);

    const savedWorkItem = await this.workItemsRepository.save(workItem);
    await this.updateInitiativeProgress(await savedWorkItem.initiative);
    const current = await WorkItemMapper.toDto(savedWorkItem);
    this.eventEmitter.emit('workItem.updated', {
      previous,
      current,
    });
    return current;
  }

  async changeAssignee(
    orgId: string,
    projectId: string,
    workItemId: string,
    userId?: string,
  ) {
    const workItem = await this.workItemsRepository.findOneByOrFail({
      id: workItemId,
      org: { id: orgId },
      project: { id: projectId },
    });
    if (!userId) {
      workItem.assignedTo = Promise.resolve(null);
      await this.workItemsRepository.save(workItem);
    } else {
      const user = await this.usersRepository.findOneByOrFail({ id: userId });
      workItem.assignedTo = Promise.resolve(user);
      await this.workItemsRepository.save(workItem);
    }
  }

  async searchWorkItems(
    orgId: string,
    projectId: string,
    search: string,
    page: number = 1,
    limit: number = 0,
    filters?: FilterOptions,
  ) {
    if (this.isReference(search)) {
      const queryBuilder = new WorkItemQueryBuilder(
        orgId,
        projectId,
        { reference: search },
        this.workItemsRepository,
        filters,
      );
      return queryBuilder.execute(page, limit);
    }

    const queryBuilder = new WorkItemQueryBuilder(
      orgId,
      projectId,
      { term: search },
      this.workItemsRepository,
      filters,
    );

    return queryBuilder.execute(page, limit);
  }

  async listWorkItemComments(
    orgId: string,
    projectId: string,
    workItemId: string,
  ) {
    const workItem = await this.workItemsRepository.findOneByOrFail({
      id: workItemId,
      org: { id: orgId },
      project: { id: projectId },
    });
    const comments = await workItem.comments;
    return await CommentMapper.toDtoList(comments);
  }

  async createWorkItemComment(
    userId: string,
    orgId: string,
    projectId: string,
    workItemId: string,
    createCommentDto: CreateUpdateCommentDto,
  ) {
    const user = await this.usersRepository.findOneByOrFail({ id: userId });
    const workItem = await this.workItemsRepository.findOneByOrFail({
      id: workItemId,
      org: { id: orgId },
      project: { id: projectId },
    });
    const org = await workItem.org;
    if (org.paymentPlan !== PaymentPlan.PREMIUM) {
      throw new Error('You need to upgrade to premium to add comments');
    }
    if (!createCommentDto.content || createCommentDto.content.trim() === '') {
      throw new Error('Comment content is required');
    }
    const comment = new WorkItemComment();
    comment.content = createCommentDto.content;
    comment.createdBy = Promise.resolve(user);
    comment.org = Promise.resolve(org);
    comment.workItem = Promise.resolve(workItem);
    comment.mentions = Promise.resolve(
      await this.usersRepository.findBy({
        id: In(createCommentDto.mentions),
      }),
    );
    const savedComment = await this.workItemCommentsRepository.save(comment);
    const savedMentions = await savedComment.mentions;
    if (savedMentions.length > 0) {
      const notification: CreateNotificationDto = {
        mentions: savedMentions,
        createdBy: user,
        org: org,
        project: await workItem.project,
        action: ActionType.CREATE,
        entity: EntityType.WORK_ITEM_COMMENT,
        status: StatusType.UNREAD,
        entityId: savedComment.id,
      };
      this.eventEmitter.emit('mention.created', notification);
    }
    return CommentMapper.toDto(savedComment);
  }

  async deleteWorkItemComment(
    userId: string,
    workItemId: string,
    commentId: string,
  ) {
    const comment = await this.workItemCommentsRepository.findOneByOrFail({
      id: commentId,
      workItem: { id: workItemId },
      createdBy: { id: userId },
    });
    await this.workItemCommentsRepository.remove(comment);
  }

  async updateWorkItemComment(
    userId: string,
    workItemId: string,
    commentId: string,
    createCommentDto: CreateUpdateCommentDto,
  ) {
    const workItem = await this.workItemsRepository.findOneByOrFail({
      id: workItemId,
    });
    const org = await workItem.org;
    if (org.paymentPlan !== PaymentPlan.PREMIUM) {
      throw new Error('You need to upgrade to premium to add comments');
    }
    if (!createCommentDto.content || createCommentDto.content.trim() === '') {
      throw new Error('Comment content is required');
    }
    const comment = await this.workItemCommentsRepository.findOneByOrFail({
      id: commentId,
      workItem: { id: workItemId },
      createdBy: { id: userId },
    });
    comment.mentions = Promise.resolve(
      await this.usersRepository.findBy({
        id: In(createCommentDto.mentions),
      }),
    );
    comment.content = createCommentDto.content;
    const savedComment = await this.workItemCommentsRepository.save(comment);
    const savedMentions = await savedComment.mentions;
    if (savedMentions.length > 0) {
      const notification: CreateNotificationDto = {
        mentions: savedMentions,
        createdBy: await comment.createdBy,
        org: org,
        project: await workItem.project,
        action: ActionType.UPDATE,
        entity: EntityType.WORK_ITEM_COMMENT,
        status: StatusType.UNREAD,
        entityId: savedComment.id,
      };
      this.eventEmitter.emit('mention.created', notification);
    }
    return await CommentMapper.toDto(savedComment);
  }

  private async setWorkItemsFiles(
    workItem: WorkItem,
    workItemDto: CreateUpdateWorkItemDto,
    savedWorkItem: WorkItem,
  ) {
    workItem.workItemFiles = Promise.resolve([]);
    await this.workItemFilesRepository.delete({
      workItem: { id: workItem.id },
    });
    if (workItemDto.files && workItemDto.files.length > 0) {
      const files = await this.filesRepository.findBy(workItemDto.files);
      const workItemFiles = files.map((file) => {
        const workItemFile = new WorkItemFile();
        workItemFile.file = Promise.resolve(file); // Assign the file entity directly
        workItemFile.workItem = Promise.resolve(savedWorkItem); // Assign the workItem entity directly
        return workItemFile;
      });
      await this.workItemFilesRepository.save(workItemFiles);
      workItem.workItemFiles = Promise.resolve(workItemFiles);
    }
  }

  private async setWorkItemData(
    workItem: WorkItem,
    workItemDto: CreateUpdateWorkItemDto,
    orgId: string,
  ) {
    workItem.title = workItemDto.title;
    workItem.description = workItemDto.description;
    workItem.mentions = Promise.resolve(
      workItemDto.mentions
        ? await this.usersRepository.findBy({
            id: In(workItemDto.mentions),
          })
        : undefined,
    );
    workItem.priority = workItemDto.priority;
    workItem.type = workItemDto.type;
    workItem.status = workItemDto.status;
    workItem.estimation = workItemDto.estimation;
    workItem.completedAt = null;
    if (
      workItemDto.status === WorkItemStatus.DONE ||
      workItemDto.status === WorkItemStatus.CLOSED
    ) {
      workItem.completedAt = new Date();
    }
    workItem.initiative = Promise.resolve(null);
    workItem.sprint = Promise.resolve(null);
    if (workItemDto.initiative) {
      const initiative = await this.initiativeRepository.findOneByOrFail({
        id: workItemDto.initiative,
        org: { id: orgId },
      });
      workItem.initiative = Promise.resolve(initiative);
    }
    if (workItemDto.sprint) {
      const sprint = await this.sprintRepository.findOneByOrFail({
        id: workItemDto.sprint,
        org: { id: orgId },
      });
      workItem.sprint = Promise.resolve(sprint);
    }
    if (workItemDto.assignedTo) {
      const assignedTo = await this.usersRepository.findOneByOrFail({
        id: workItemDto.assignedTo,
        org: { id: orgId },
      });
      workItem.assignedTo = Promise.resolve(assignedTo);
    } else if (await workItem.assignedTo) {
      workItem.assignedTo = Promise.resolve(null);
    }
    if (workItemDto.issue) {
      const issue = await this.issuesRepository.findOneByOrFail({
        id: workItemDto.issue,
        org: { id: orgId },
      });
      workItem.issue = Promise.resolve(issue);
    } else if (await workItem.issue) {
      workItem.issue = Promise.resolve(null);
    }
  }

  private async updateInitiativeProgress(initiative: Initiative) {
    if (!initiative) return;

    const workItems = await initiative.workItems;
    initiative.workItemsCount = workItems.length;
    initiative.progress = 0;
    await this.initiativeRepository.save(initiative);

    if (workItems.length > 0) {
      const completedWorkItems = workItems.filter(
        (workItem) =>
          workItem.status === WorkItemStatus.DONE ||
          workItem.status === WorkItemStatus.CLOSED,
      );
      initiative.progress = (completedWorkItems.length / workItems.length) * 100;
      await this.initiativeRepository.save(initiative);
    }
  }

  private async updateSprint(
    workItem: WorkItem,
    workItemPatchDto: WorkItemPatchDto,
    orgId: string,
    currentSprint: Sprint,
  ) {
    if (workItemPatchDto.sprint) {
      const sprint = await this.sprintRepository.findOneByOrFail({
        id: workItemPatchDto.sprint,
        org: { id: orgId },
      });
      workItem.sprint = Promise.resolve(sprint);
    } else if (
      currentSprint != null &&
      workItemPatchDto.sprint === null
    ) {
      workItem.sprint = Promise.resolve(null);
    }
  }

  private updateStatusAndCompletionDate(
    workItem: WorkItem,
    workItemPatchDto: WorkItemPatchDto,
  ) {
    if (workItemPatchDto.status) {
      workItem.status = workItemPatchDto.status;
      workItem.completedAt = [
        WorkItemStatus.DONE,
        WorkItemStatus.CLOSED,
      ].includes(workItemPatchDto.status)
        ? new Date()
        : null;
    }
  }

  private updatePriority(
    workItem: WorkItem,
    workItemPatchDto: WorkItemPatchDto,
  ) {
    if (workItemPatchDto.priority) {
      workItem.priority = workItemPatchDto.priority;
    }
  }

  private async deleteWorkItemFiles(
    orgId: string,
    projectId: string,
    workItemId: string,
  ) {
    const workItemFiles = await this.workItemFilesRepository.find({
      where: { workItem: { id: workItemId } },
    });
    for (const workItemFile of workItemFiles) {
      const file = await workItemFile.file;
      await this.filesService.deleteFile(orgId, projectId, file.id);
    }
  }

  private isReference(search: string) {
    return /^[Ww][Ii]-\d+$/.test(search);
  }

  private async searchWorkItemsByTitleOrDescription(
    orgId: string,
    projectId: string,
    search: string,
    page: number,
    limit: number,
  ) {
    let query = `
            SELECT *
            FROM work_item
            WHERE work_item."orgId" = $1
              AND work_item."projectId" = $2
              AND (work_item.title ILIKE $3 OR work_item.description ILIKE $3)
            ORDER BY CASE
                         WHEN work_item."priority" = 'high' THEN 1
                         WHEN work_item."priority" = 'medium' THEN 2
                         WHEN work_item."priority" = 'low' THEN 3
                         ELSE 4
                         END,
                     work_item."createdAt" DESC
        `;
    let params = [orgId, projectId, `%${search}%`] as any[];

    if (limit > 0) {
      query += ' OFFSET $4 LIMIT $5';
      const offset = (page - 1) * limit;
      params = [orgId, projectId, `%${search}%`, offset, limit];
    }

    const workItems = await this.workItemsRepository.query(query, params);

    return WorkItemMapper.toSimpleListDto(workItems);
  }

  private async searchWorkItemsByReference(
    orgId: string,
    projectId: string,
    search: string,
    page: number,
    limit: number,
  ) {
    let query = `
            SELECT *
            FROM work_item
            WHERE work_item."orgId" = $1
              AND work_item."projectId" = $2
              AND LOWER(work_item."reference") = LOWER($3)
            ORDER BY CASE
                         WHEN work_item."priority" = 'high' THEN 1
                         WHEN work_item."priority" = 'medium' THEN 2
                         WHEN work_item."priority" = 'low' THEN 3
                         ELSE 4
                         END,
                     work_item."createdAt" DESC
        `;

    let params = [orgId, projectId, search] as any[];

    if (limit > 0) {
      query += ' OFFSET $4 LIMIT $5';
      const offset = (page - 1) * limit;
      params = [orgId, projectId, search, offset, limit];
    }

    const workItems = await this.workItemsRepository.query(query, params);

    return WorkItemMapper.toSimpleListDto(workItems);
  }
}
