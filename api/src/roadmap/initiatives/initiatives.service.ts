import { Injectable } from '@nestjs/common';
import { CreateUpdateInitiativeDto, PatchInitiativeDto } from './dtos';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Initiative } from './initiative.entity';
import { InitiativeMapper } from './initiative.mapper';
import { Priority } from '../../common/priority.enum';
import { OkrsService } from '../../okrs/okrs.service';
import { MilestonesService } from '../milestones/milestones.service';
import { WorkItemsService } from '../../backlog/work-items/work-items.service';
import { InitiativeFile } from './initiative-file.entity';
import { File } from '../../files/file.entity';
import { User } from '../../users/user.entity';
import { FilesService } from '../../files/files.service';
import { Org } from '../../orgs/org.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CommentMapper } from '../../comments/mappers';
import { CreateUpdateCommentDto } from '../../comments/dtos';
import { InitiativeComment } from './initiative-comment.entity';
import { FeatureRequest } from '../../feature-requests/feature-request.entity';
import { Project } from '../../projects/project.entity';
import {
  InitiativeQueryBuilder,
  FilterOptions,
} from './initiative.query-builder';
import { InitiativeStatus } from './initiativestatus.enum';
import {
  ActionType,
  EntityType,
  StatusType,
} from '../../notifications/notification.entity';
import { CreateNotificationDto } from '../../notifications/dtos';

@Injectable()
export class InitiativesService {
  constructor(
    @InjectRepository(Initiative)
    private initiativeRepository: Repository<Initiative>,
    @InjectRepository(User) private userRepository: Repository<User>,
    private okrsService: OkrsService,
    private milestonesService: MilestonesService,
    private workItemsService: WorkItemsService,
    @InjectRepository(InitiativeFile)
    private initiativeFileRepository: Repository<InitiativeFile>,
    @InjectRepository(File) private filesRepository: Repository<File>,
    private filesService: FilesService,
    private eventEmitter: EventEmitter2,
    @InjectRepository(InitiativeComment)
    private initiativeCommentRepository: Repository<InitiativeComment>,
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(FeatureRequest)
    private featureRequestsRepository: Repository<FeatureRequest>,
    @InjectRepository(Project) private projectsRepository: Repository<Project>,
  ) {}

  async createInitiative(
    orgId: string,
    projectId: string,
    userId: string,
    initiativeDto: CreateUpdateInitiativeDto,
  ) {
    if (!userId) throw new Error('User id is required');
    this.validateInitiative(initiativeDto);
    const user = await this.userRepository.findOneByOrFail({
      id: userId,
      org: { id: orgId },
    });
    const project = await this.projectsRepository.findOneByOrFail({
      id: projectId,
      org: { id: orgId },
    });
    const org = await user.org;
    const initiative = new Initiative();
    initiative.title = initiativeDto.title;
    initiative.description = initiativeDto.description;
    initiative.priority = initiativeDto.priority;
    initiative.status = initiativeDto.status;
    initiative.org = Promise.resolve(org);
    initiative.createdBy = Promise.resolve(user);
    initiative.project = Promise.resolve(project);
    initiative.mentions = Promise.resolve(
      initiativeDto.mentions
        ? await this.usersRepository.findBy({
            id: In(initiativeDto.mentions),
          })
        : undefined,
    );

    if (initiativeDto.status === InitiativeStatus.COMPLETED) {
      initiative.completedAt = new Date();
    }

    await this.setInitiativeAssignedTo(initiativeDto, org, initiative);
    await this.setInitiativeKeyResult(
      initiativeDto,
      org,
      projectId,
      initiative,
    );

    if (initiativeDto.milestone) {
      const milestone = await this.milestonesService.findOneById(
        org.id,
        projectId,
        initiativeDto.milestone,
      );
      initiative.milestone = Promise.resolve(milestone);
    }

    if (initiativeDto.featureRequest) {
      const featureRequest =
        await this.featureRequestsRepository.findOneByOrFail({
          org: { id: org.id },
          project: { id: projectId },
          id: initiativeDto.featureRequest,
        });
      initiative.featureRequest = Promise.resolve(featureRequest);
    }

    await this.initiativeRepository.save(initiative);
    const savedInitiative = await this.initiativeRepository.findOneByOrFail({
      id: initiative.id,
    });

    if (initiativeDto.files) {
      await this.addInitiativeFiles(initiativeDto, initiative);
    }

    const createdInitiative = await InitiativeMapper.toDto(savedInitiative);
    this.eventEmitter.emit('initiative.created', createdInitiative);
    const mentions = await savedInitiative.mentions;
    if (mentions.length > 0) {
      const notification: CreateNotificationDto = {
        mentions,
        org,
        project,
        createdBy: user,
        action: ActionType.CREATE,
        entity: EntityType.INITIATIVE_DESCRIPTION,
        status: StatusType.UNREAD,
        entityId: savedInitiative.id,
      };
      this.eventEmitter.emit('mention.created', notification);
    }
    return createdInitiative;
  }

  async listInitiatives(
    orgId: string,
    projectId: string,
    page: number = 1,
    limit: number = 0,
  ) {
    let query = `
            SELECT *
            FROM initiative
            WHERE initiative."orgId" = $1
              AND initiative."projectId" = $2
            ORDER BY CASE
                         WHEN initiative."priority" = 'high' THEN 1
                         WHEN initiative."priority" = 'medium' THEN 2
                         WHEN initiative."priority" = 'low' THEN 3
                         ELSE 4
                         END,
                     initiative."createdAt" DESC
        `;
    let params = [orgId, projectId] as any[];
    if (limit > 0) {
      query += ' OFFSET $3 LIMIT $4';
      const offset = (page - 1) * limit;
      params = [orgId, projectId, offset, limit];
    }

    const initiatives = await this.initiativeRepository.query(query, params);
    return await InitiativeMapper.toListDtoWithoutAssignees(initiatives);
  }

  async listInitiativesWithoutMilestone(orgId: string, projectId: string) {
    const initiatives = await this.initiativeRepository
      .createQueryBuilder('feature')
      .leftJoinAndSelect('feature.org', 'org')
      .leftJoinAndSelect('feature.milestone', 'milestone')
      .leftJoinAndSelect('feature.assignedTo', 'assignedTo')
      .where('org.id = :orgId', { orgId })
      .andWhere('feature.projectId = :projectId', { projectId })
      .andWhere('milestone.id IS NULL')
      .andWhere('feature.status not in (:...status)', {
        status: ['closed', 'completed'],
      })
      .getMany();

    return await InitiativeMapper.toListDto(initiatives);
  }

  async getInitiative(orgId: string, projectId: string, id: string) {
    const initiative = await this.initiativeRepository.findOneByOrFail({
      org: { id: orgId },
      project: { id: projectId },
      id: id,
    });
    return await InitiativeMapper.toDto(initiative);
  }

  async updateInitiative(
    userId: string,
    orgId: string,
    projectId: string,
    id: string,
    updateInitiativeDto: CreateUpdateInitiativeDto,
  ) {
    this.validateInitiative(updateInitiativeDto);
    const initiative = await this.initiativeRepository.findOneByOrFail({
      org: { id: orgId },
      project: { id: projectId },
      id: id,
    });
    const originalInitiative = await InitiativeMapper.toDto(initiative);

    initiative.title = updateInitiativeDto.title;
    initiative.description = updateInitiativeDto.description;
    initiative.priority = updateInitiativeDto.priority;
    initiative.status = updateInitiativeDto.status;
    initiative.mentions = Promise.resolve(
      await this.usersRepository.findBy({
        id: In(updateInitiativeDto.mentions),
      }),
    );

    if (updateInitiativeDto.status === InitiativeStatus.COMPLETED) {
      initiative.completedAt = new Date();
    }

    await this.updateInitiativeKeyResult(
      updateInitiativeDto,
      orgId,
      projectId,
      initiative,
    );

    await this.updateInitiativeFeatureRequest(
      updateInitiativeDto,
      orgId,
      projectId,
      initiative,
    );

    await this.updateInitiativeMilestone(
      updateInitiativeDto,
      orgId,
      projectId,
      initiative,
    );

    await this.updateInitiativeFiles(updateInitiativeDto, initiative);

    await this.updateInitiativeAssignedTo(
      updateInitiativeDto.assignedTo,
      orgId,
      initiative,
    );

    const savedInitiative = await this.initiativeRepository.save(initiative);
    const updatedInitiative = await InitiativeMapper.toDto(savedInitiative);
    this.eventEmitter.emit('initiative.updated', {
      previous: originalInitiative,
      current: updatedInitiative,
    });
    const mentions = await savedInitiative.mentions;
    if (mentions.length > 0) {
      const notification: CreateNotificationDto = {
        mentions,
        createdBy: await this.userRepository.findOneByOrFail({ id: userId }),
        org: await savedInitiative.org,
        project: await savedInitiative.project,
        action: ActionType.UPDATE,
        entity: EntityType.INITIATIVE_DESCRIPTION,
        status: StatusType.UNREAD,
        entityId: savedInitiative.id,
      };
      this.eventEmitter.emit('mention.created', notification);
    }
    return updatedInitiative;
  }

  async changeAssignee(
    orgId: string,
    projectId: string,
    initiativeId: string,
    assigneeId?: string,
  ) {
    const initiative = await this.initiativeRepository.findOneByOrFail({
      org: { id: orgId },
      project: { id: projectId },
      id: initiativeId,
    });
    await this.updateInitiativeAssignedTo(assigneeId, orgId, initiative);
    await this.initiativeRepository.save(initiative);
  }

  async deleteInitiative(orgId: string, projectId: string, id: string) {
    const initiative = await this.initiativeRepository.findOneByOrFail({
      org: { id: orgId },
      project: { id: projectId },
      id: id,
    });
    const deletedInitiative = await InitiativeMapper.toDto(initiative);
    await this.deleteInitiativeFiles(orgId, projectId, initiative.id);
    await this.workItemsService.removeInitiativeFromWorkItems(
      orgId,
      projectId,
      id,
    );
    await this.initiativeRepository.remove(initiative);
    this.eventEmitter.emit('initiative.deleted', deletedInitiative);
  }

  async patchInitiative(
    orgId: string,
    projectId: string,
    initiativeId: string,
    patchInitiativeDto: PatchInitiativeDto,
  ) {
    const initiative = await this.initiativeRepository.findOneByOrFail({
      org: { id: orgId },
      project: { id: projectId },
      id: initiativeId,
    });
    const originalInitiative = await InitiativeMapper.toDto(initiative);
    this.patchInitiativeStatus(patchInitiativeDto, initiative);
    this.patchInitiativePriority(patchInitiativeDto, initiative);
    await this.patchInitiativeMilestone(
      patchInitiativeDto,
      orgId,
      projectId,
      initiative,
    );
    await this.patchInitiativeKeyResult(
      patchInitiativeDto,
      orgId,
      projectId,
      initiative,
    );
    await this.patchInitiativeFeatureRequest(
      patchInitiativeDto,
      orgId,
      projectId,
      initiative,
    );
    const savedInitiative = await this.initiativeRepository.save(initiative);
    const updatedInitiative = await InitiativeMapper.toDto(savedInitiative);
    this.eventEmitter.emit('initiative.updated', {
      previous: originalInitiative,
      current: updatedInitiative,
    });
    return updatedInitiative;
  }

  async searchInitiatives(
    orgId: string,
    projectId: string,
    search: string,
    page: number = 1,
    limit: number = 0,
    filters?: FilterOptions,
  ) {
    if (this.isReference(search)) {
      const queryBuilder = new InitiativeQueryBuilder(
        orgId,
        projectId,
        { reference: search },
        this.initiativeRepository,
        filters,
      );
      return queryBuilder.execute(page, limit);
    }

    const queryBuilder = new InitiativeQueryBuilder(
      orgId,
      projectId,
      { term: search },
      this.initiativeRepository,
      filters,
    );

    return queryBuilder.execute(page, limit);
  }

  async listInitiativeComments(initiativeId: string) {
    const initiative = await this.initiativeRepository.findOneByOrFail({
      id: initiativeId,
    });

    const comments = await initiative.comments;
    return await CommentMapper.toDtoList(comments);
  }

  async createInitiativeComment(
    userId: string,
    initiativeId: string,
    createCommentDto: CreateUpdateCommentDto,
  ) {
    const user = await this.usersRepository.findOneByOrFail({ id: userId });
    const initiative = await this.initiativeRepository.findOneByOrFail({
      id: initiativeId,
    });

    const org = await initiative.org;

    if (!createCommentDto.content || createCommentDto.content.trim() === '') {
      throw new Error('Comment content is required');
    }
    const comment = new InitiativeComment();
    comment.content = createCommentDto.content;
    comment.createdBy = Promise.resolve(user);
    comment.org = Promise.resolve(org);
    comment.initiative = Promise.resolve(initiative);
    comment.mentions = Promise.resolve(
      await this.usersRepository.findBy({
        id: In(createCommentDto.mentions),
      }),
    );
    const savedComment = await this.initiativeCommentRepository.save(comment);
    const mentions = await savedComment.mentions;
    if (mentions.length > 0) {
      const notification: CreateNotificationDto = {
        mentions,
        createdBy: await this.userRepository.findOneByOrFail({ id: userId }),
        org: org,
        project: await initiative.project,
        action: ActionType.CREATE,
        entity: EntityType.INITIATIVE_COMMENT,
        status: StatusType.UNREAD,
        entityId: savedComment.id,
      };
      this.eventEmitter.emit('mention.created', notification);
    }
    return CommentMapper.toDto(savedComment);
  }

  async deleteInitiativeComment(
    userId: string,
    initiativeId: string,
    commentId: string,
  ) {
    const comment = await this.initiativeCommentRepository.findOneByOrFail({
      id: commentId,
      initiative: { id: initiativeId },
      createdBy: { id: userId },
    });
    await this.initiativeCommentRepository.remove(comment);
  }

  async updateInitiativeComment(
    userId: string,
    initiativeId: string,
    commentId: string,
    createCommentDto: CreateUpdateCommentDto,
  ) {
    if (!createCommentDto.content || createCommentDto.content.trim() === '') {
      throw new Error('Comment content is required');
    }
    const comment = await this.initiativeCommentRepository.findOneByOrFail({
      id: commentId,
      initiative: { id: initiativeId },
      createdBy: { id: userId },
    });
    comment.content = createCommentDto.content;
    comment.mentions = Promise.resolve(
      await this.usersRepository.findBy({
        id: In(createCommentDto.mentions),
      }),
    );
    const savedComment = await this.initiativeCommentRepository.save(comment);
    const mentions = await savedComment.mentions;
    if (mentions.length > 0) {
      const notification: CreateNotificationDto = {
        mentions,
        createdBy: await this.userRepository.findOneByOrFail({ id: userId }),
        org: await savedComment.org,
        project: await (await savedComment.initiative).project,
        action: ActionType.UPDATE,
        entity: EntityType.INITIATIVE_COMMENT,
        status: StatusType.UNREAD,
        entityId: savedComment.id,
      };
      this.eventEmitter.emit('mention.created', notification);
    }
    return await CommentMapper.toDto(savedComment);
  }

  private async setInitiativeKeyResult(
    initiativeDto: CreateUpdateInitiativeDto,
    org: Org,
    projectId: string,
    initiative: Initiative,
  ) {
    if (initiativeDto.keyResult) {
      const keyResult = await this.okrsService.getKeyResultByOrgAndProject(
        org.id,
        projectId,
        initiativeDto.keyResult,
      );
      initiative.keyResult = Promise.resolve(keyResult);
    }
  }

  private async setInitiativeAssignedTo(
    initiativeDto: CreateUpdateInitiativeDto,
    org: Org,
    initiative: Initiative,
  ) {
    if (initiativeDto.assignedTo) {
      const assignedTo = await this.userRepository.findOneByOrFail({
        id: initiativeDto.assignedTo,
        org: { id: org.id },
      });
      if (assignedTo) {
        initiative.assignedTo = Promise.resolve(assignedTo);
      }
    }
  }

  private async addInitiativeFiles(
    initiativeDto: CreateUpdateInitiativeDto,
    initiative: Initiative,
  ) {
    const files = await this.filesRepository.findBy({
      id: In(initiativeDto.files.map((file) => file.id)),
    });
    await this.initiativeFileRepository.delete({
      initiative: { id: initiative.id },
    });
    const initiativeFiles = files.map((file) => {
      const initiativeFile = new InitiativeFile();
      initiativeFile.initiative = Promise.resolve(initiative);
      initiativeFile.file = Promise.resolve(file);
      return initiativeFile;
    });
    await this.initiativeFileRepository.save(initiativeFiles);
    initiative.initiativeFiles = Promise.resolve(initiativeFiles);
  }

  private validateInitiative(initiativeDto: CreateUpdateInitiativeDto) {
    if (!initiativeDto.title) throw new Error('Initiative title is required');
    if (!initiativeDto.priority)
      throw new Error('Initiative priority is required');
    if (!initiativeDto.status) throw new Error('Initiative status is required');
    if (!Object.values(Priority).includes(initiativeDto.priority))
      throw new Error('Invalid priority');
  }

  private async updateInitiativeAssignedTo(
    assignedToId: string | undefined,
    orgId: string,
    initiative: Initiative,
  ) {
    if (assignedToId) {
      const assignedTo = await this.userRepository.findOneByOrFail({
        id: assignedToId,
        org: { id: orgId },
      });
      initiative.assignedTo = Promise.resolve(assignedTo);
    } else if (await initiative.assignedTo) {
      initiative.assignedTo = Promise.resolve(null);
    }
  }

  private async updateInitiativeFiles(
    updateInitiativeDto: CreateUpdateInitiativeDto,
    initiative: Initiative,
  ) {
    if (updateInitiativeDto.files) {
      await this.addInitiativeFiles(updateInitiativeDto, initiative);
    } else {
      initiative.initiativeFiles = Promise.resolve([]);
    }
  }

  private async updateInitiativeMilestone(
    updateInitiativeDto: CreateUpdateInitiativeDto,
    orgId: string,
    projectId: string,
    initiative: Initiative,
  ) {
    if (updateInitiativeDto.milestone) {
      const milestone = await this.milestonesService.findOneById(
        orgId,
        projectId,
        updateInitiativeDto.milestone,
      );
      initiative.milestone = Promise.resolve(milestone);
    } else {
      initiative.milestone = Promise.resolve(null);
    }
  }

  private async updateInitiativeKeyResult(
    updateInitiativeDto: CreateUpdateInitiativeDto,
    orgId: string,
    projectId: string,
    initiative: Initiative,
  ) {
    if (updateInitiativeDto.keyResult) {
      const keyResult = await this.okrsService.getKeyResultByOrgAndProject(
        orgId,
        projectId,
        updateInitiativeDto.keyResult,
      );
      initiative.keyResult = Promise.resolve(keyResult);
    } else {
      initiative.keyResult = Promise.resolve(null);
    }
  }

  private async patchInitiativeKeyResult(
    patchInitiativeDto: PatchInitiativeDto,
    orgId: string,
    projectId: string,
    initiative: Initiative,
  ) {
    if (patchInitiativeDto.keyResult) {
      const keyResult = await this.okrsService.getKeyResultByOrgAndProject(
        orgId,
        projectId,
        patchInitiativeDto.keyResult,
      );
      initiative.keyResult = Promise.resolve(keyResult);
    } else if (
      patchInitiativeDto.keyResult === null &&
      (await initiative.keyResult)
    ) {
      initiative.keyResult = Promise.resolve(null);
    }
  }

  private async patchInitiativeMilestone(
    patchInitiativeDto: PatchInitiativeDto,
    orgId: string,
    projectId: string,
    initiative: Initiative,
  ) {
    if (patchInitiativeDto.milestone) {
      const milestone = await this.milestonesService.findOneById(
        orgId,
        projectId,
        patchInitiativeDto.milestone,
      );
      initiative.milestone = Promise.resolve(milestone);
    } else if (
      patchInitiativeDto.milestone === null &&
      (await initiative.milestone)
    ) {
      initiative.milestone = Promise.resolve(null);
    }
  }

  private patchInitiativePriority(
    patchInitiativeDto: PatchInitiativeDto,
    initiative: Initiative,
  ) {
    if (patchInitiativeDto.priority) {
      initiative.priority = patchInitiativeDto.priority;
    }
  }

  private patchInitiativeStatus(
    patchInitiativeDto: PatchInitiativeDto,
    initiative: Initiative,
  ) {
    if (patchInitiativeDto.status) {
      initiative.status = patchInitiativeDto.status;
    }
  }

  private async deleteInitiativeFiles(
    orgId: string,
    projectId: string,
    id: string,
  ) {
    const initiativeFiles = await this.initiativeFileRepository.findBy({
      initiative: { id, org: { id: orgId } },
    });

    for (const initiativeFile of initiativeFiles) {
      const file = await initiativeFile.file;
      await this.filesService.deleteFile(orgId, projectId, file.id);
    }
  }

  private isReference(search: string) {
    return /^[iI]-\d+$/.test(search);
  }

  private async searchInitiativesByTitleOrDescription(
    orgId: string,
    projectId: string,
    search: string,
    page: number,
    limit: number,
  ) {
    let query = `
            SELECT *
            FROM feature
            WHERE feature."orgId" = $1
              AND feature."projectId" = $2
              AND (feature.title ILIKE $3 OR feature.description ILIKE $3)
            ORDER BY CASE
                         WHEN feature."priority" = 'high' THEN 1
                         WHEN feature."priority" = 'medium' THEN 2
                         WHEN feature."priority" = 'low' THEN 3
                         ELSE 4
                         END,
                     feature."createdAt" DESC
        `;
    let params = [orgId, projectId, `%${search}%`] as any[];

    if (limit > 0) {
      query += ' OFFSET $4 LIMIT $5';
      const offset = (page - 1) * limit;
      params = [orgId, projectId, `%${search}%`, offset, limit];
    }

    const initiatives = await this.initiativeRepository.query(query, params);

    return await InitiativeMapper.toListDtoWithoutAssignees(initiatives);
  }

  private async searchInitiativesByReference(
    orgId: string,
    projectId: string,
    search: string,
    page: number,
    limit: number,
  ) {
    let query = `
            SELECT *
            FROM feature
            WHERE feature."orgId" = $1
              AND feature."projectId" = $2
              AND LOWER(feature.reference) LIKE LOWER($3)
            ORDER BY CASE
                         WHEN feature."priority" = 'high' THEN 1
                         WHEN feature."priority" = 'medium' THEN 2
                         WHEN feature."priority" = 'low' THEN 3
                         ELSE 4
                         END,
                     feature."createdAt" DESC
        `;

    let params = [orgId, projectId, search] as any[];

    if (limit > 0) {
      query += ' OFFSET $4 LIMIT $5';
      const offset = (page - 1) * limit;
      params = [orgId, projectId, search, offset, limit];
    }

    const initiatives = await this.initiativeRepository.query(query, params);

    return await InitiativeMapper.toListDtoWithoutAssignees(initiatives);
  }

  private async updateInitiativeFeatureRequest(
    updateInitiativeDto: CreateUpdateInitiativeDto,
    orgId: string,
    projectId: string,
    initiative: Initiative,
  ) {
    if (updateInitiativeDto.featureRequest) {
      const featureRequest =
        await this.featureRequestsRepository.findOneByOrFail({
          org: { id: orgId },
          project: { id: projectId },
          id: updateInitiativeDto.featureRequest,
        });
      initiative.featureRequest = Promise.resolve(featureRequest);
    } else {
      initiative.featureRequest = Promise.resolve(null);
    }
  }

  private async patchInitiativeFeatureRequest(
    patchInitiativeDto: PatchInitiativeDto,
    orgId: string,
    projectId: string,
    initiative: Initiative,
  ) {
    if (patchInitiativeDto.featureRequest === null) {
      initiative.featureRequest = Promise.resolve(null);
    } else if (patchInitiativeDto.featureRequest) {
      const featureRequest =
        await this.featureRequestsRepository.findOneByOrFail({
          org: { id: orgId },
          project: { id: projectId },
          id: patchInitiativeDto.featureRequest,
        });
      initiative.featureRequest = Promise.resolve(featureRequest);
    } else {
      initiative.featureRequest = Promise.resolve(null);
    }
  }
}
