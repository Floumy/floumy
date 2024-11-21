import { Injectable } from '@nestjs/common';
import { CreateUpdateWorkItemDto, WorkItemPatchDto } from './dtos';
import { InjectRepository } from '@nestjs/typeorm';
import { Feature } from '../../roadmap/features/feature.entity';
import { Repository } from 'typeorm';
import { WorkItem } from './work-item.entity';
import WorkItemMapper from './work-item.mapper';
import { WorkItemStatus } from './work-item-status.enum';
import { Iteration } from '../../iterations/Iteration.entity';
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

@Injectable()
export class WorkItemsService {
  constructor(
    @InjectRepository(WorkItem)
    private workItemsRepository: Repository<WorkItem>,
    @InjectRepository(Feature) private featuresRepository: Repository<Feature>,
    @InjectRepository(Iteration)
    private iterationsRepository: Repository<Iteration>,
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
    const feature = await savedWorkItem.feature;
    await this.updateFeatureProgress(feature);
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
    const oldFeature = await workItem.feature;
    await this.setWorkItemData(workItem, workItemDto, orgId);
    const savedWorkItem = await this.workItemsRepository.save(workItem);
    const newFeature = await savedWorkItem.feature;
    await this.updateFeatureProgress(oldFeature);
    if (newFeature && (!oldFeature || oldFeature.id !== newFeature.id)) {
      await this.updateFeatureProgress(newFeature);
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

    const feature = await workItem.feature;

    await this.workItemsRepository.remove(workItem);

    if (feature) {
      await this.updateFeatureProgress(feature);
    }
    this.eventEmitter.emit('workItem.deleted', deletedWorkItem);
  }

  removeFeatureFromWorkItems(orgId: string, projectId: string, id: string) {
    return this.workItemsRepository.update(
      { org: { id: orgId }, feature: { id }, project: { id: projectId } },
      { feature: null },
    );
  }

  async listOpenWorkItemsWithoutIterations(orgId: string, projectId: string) {
    const workItems = await this.workItemsRepository
      .createQueryBuilder('workItem')
      .leftJoinAndSelect('workItem.feature', 'feature')
      .leftJoinAndSelect('workItem.assignedTo', 'assignedTo')
      .where('workItem.orgId = :orgId', { orgId })
      .andWhere('workItem.projectId = :projectId', { projectId })
      .andWhere('workItem.status NOT IN (:closedStatus, :doneStatus)', {
        closedStatus: WorkItemStatus.CLOSED,
        doneStatus: WorkItemStatus.DONE,
      })
      .andWhere('workItem.iterationId IS NULL')
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
    const currentIteration = await workItem.iteration;

    await this.updateIteration(
      workItem,
      workItemPatchDto,
      orgId,
      currentIteration,
    );
    this.updateStatusAndCompletionDate(workItem, workItemPatchDto);
    this.updatePriority(workItem, workItemPatchDto);

    const savedWorkItem = await this.workItemsRepository.save(workItem);
    await this.updateFeatureProgress(await savedWorkItem.feature);
    const current = await WorkItemMapper.toDto(savedWorkItem);
    this.eventEmitter.emit('workItem.updated', {
      previous,
      current,
    });
    return current;
  }

  async searchWorkItems(
    orgId: string,
    projectId: string,
    search: string,
    page: number = 1,
    limit: number = 0,
  ) {
    if (!search) return [];

    if (this.isReference(search)) {
      return await this.searchWorkItemsByReference(
        orgId,
        projectId,
        search,
        page,
        limit,
      );
    }

    return await this.searchWorkItemsByTitleOrDescription(
      orgId,
      projectId,
      search,
      page,
      limit,
    );
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
    const savedComment = await this.workItemCommentsRepository.save(comment);
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
    comment.content = createCommentDto.content;
    const savedComment = await this.workItemCommentsRepository.save(comment);
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
    workItem.feature = Promise.resolve(null);
    workItem.iteration = Promise.resolve(null);
    if (workItemDto.feature) {
      const feature = await this.featuresRepository.findOneByOrFail({
        id: workItemDto.feature,
        org: { id: orgId },
      });
      workItem.feature = Promise.resolve(feature);
    }
    if (workItemDto.iteration) {
      const iteration = await this.iterationsRepository.findOneByOrFail({
        id: workItemDto.iteration,
        org: { id: orgId },
      });
      workItem.iteration = Promise.resolve(iteration);
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

  private async updateFeatureProgress(feature: Feature) {
    if (!feature) return;

    const workItems = await feature.workItems;
    feature.workItemsCount = workItems.length;
    feature.progress = 0;
    await this.featuresRepository.save(feature);

    if (workItems.length > 0) {
      const completedWorkItems = workItems.filter(
        (workItem) =>
          workItem.status === WorkItemStatus.DONE ||
          workItem.status === WorkItemStatus.CLOSED,
      );
      feature.progress = (completedWorkItems.length / workItems.length) * 100;
      await this.featuresRepository.save(feature);
    }
  }

  private async updateIteration(
    workItem: WorkItem,
    workItemPatchDto: WorkItemPatchDto,
    orgId: string,
    currentIteration: Iteration,
  ) {
    if (workItemPatchDto.iteration) {
      const iteration = await this.iterationsRepository.findOneByOrFail({
        id: workItemPatchDto.iteration,
        org: { id: orgId },
      });
      workItem.iteration = Promise.resolve(iteration);
    } else if (
      currentIteration != null &&
      workItemPatchDto.iteration === null
    ) {
      workItem.iteration = Promise.resolve(null);
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
          AND CAST(work_item."sequenceNumber" AS TEXT) LIKE $3
        ORDER BY CASE
                     WHEN work_item."priority" = 'high' THEN 1
                     WHEN work_item."priority" = 'medium' THEN 2
                     WHEN work_item."priority" = 'low' THEN 3
                     ELSE 4
                     END,
                 work_item."createdAt" DESC
    `;

    const referenceSequenceNumber = search.split('-')[1];
    let params = [orgId, projectId, `${referenceSequenceNumber}%`] as any[];

    if (limit > 0) {
      query += ' OFFSET $4 LIMIT $5';
      const offset = (page - 1) * limit;
      params = [orgId, projectId, `${referenceSequenceNumber}%`, offset, limit];
    }

    const workItems = await this.workItemsRepository.query(query, params);

    return WorkItemMapper.toSimpleListDto(workItems);
  }
}
