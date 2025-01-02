import { Injectable } from '@nestjs/common';
import { CreateUpdateFeatureDto, PatchFeatureDto } from './dtos';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Feature } from './feature.entity';
import { FeatureMapper } from './feature.mapper';
import { Priority } from '../../common/priority.enum';
import { OkrsService } from '../../okrs/okrs.service';
import { MilestonesService } from '../milestones/milestones.service';
import { WorkItemsService } from '../../backlog/work-items/work-items.service';
import { FeatureFile } from './feature-file.entity';
import { File } from '../../files/file.entity';
import { User } from '../../users/user.entity';
import { FilesService } from '../../files/files.service';
import { Org } from '../../orgs/org.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CommentMapper } from '../../comments/mappers';
import { CreateUpdateCommentDto } from '../../comments/dtos';
import { FeatureComment } from './feature-comment.entity';
import { FeatureRequest } from '../../feature-requests/feature-request.entity';
import { Project } from '../../projects/project.entity';
import { FeatureQueryBuilder, FilterOptions } from './feature.query-builder';
import { FeatureStatus } from './featurestatus.enum';
import {
  ActionType,
  EntityType,
  StatusType,
} from '../../notifications/notification.entity';
import { CreateNotificationDto } from '../../notifications/dtos';

@Injectable()
export class FeaturesService {
  constructor(
    @InjectRepository(Feature) private featuresRepository: Repository<Feature>,
    @InjectRepository(User) private userRepository: Repository<User>,
    private okrsService: OkrsService,
    private milestonesService: MilestonesService,
    private workItemsService: WorkItemsService,
    @InjectRepository(FeatureFile)
    private featureFilesRepository: Repository<FeatureFile>,
    @InjectRepository(File) private filesRepository: Repository<File>,
    private filesService: FilesService,
    private eventEmitter: EventEmitter2,
    @InjectRepository(FeatureComment)
    private featureCommentsRepository: Repository<FeatureComment>,
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(FeatureRequest)
    private featureRequestsRepository: Repository<FeatureRequest>,
    @InjectRepository(Project) private projectsRepository: Repository<Project>,
  ) {}

  async createFeature(
    orgId: string,
    projectId: string,
    userId: string,
    featureDto: CreateUpdateFeatureDto,
  ) {
    if (!userId) throw new Error('User id is required');
    this.validateFeature(featureDto);
    const user = await this.userRepository.findOneByOrFail({
      id: userId,
      org: { id: orgId },
    });
    const project = await this.projectsRepository.findOneByOrFail({
      id: projectId,
      org: { id: orgId },
    });
    const org = await user.org;
    const feature = new Feature();
    feature.title = featureDto.title;
    feature.description = featureDto.description;
    feature.priority = featureDto.priority;
    feature.status = featureDto.status;
    feature.org = Promise.resolve(org);
    feature.createdBy = Promise.resolve(user);
    feature.project = Promise.resolve(project);
    feature.mentions = Promise.resolve(
      featureDto.mentions
        ? await this.usersRepository.findBy({
            id: In(featureDto.mentions),
          })
        : undefined,
    );

    if (featureDto.status === FeatureStatus.COMPLETED) {
      feature.completedAt = new Date();
    }

    await this.setFeatureAssignedTo(featureDto, org, feature);
    await this.setFeatureKeyResult(featureDto, org, projectId, feature);

    if (featureDto.milestone) {
      const milestone = await this.milestonesService.findOneById(
        org.id,
        projectId,
        featureDto.milestone,
      );
      feature.milestone = Promise.resolve(milestone);
    }

    if (featureDto.featureRequest) {
      const featureRequest =
        await this.featureRequestsRepository.findOneByOrFail({
          org: { id: org.id },
          project: { id: projectId },
          id: featureDto.featureRequest,
        });
      feature.featureRequest = Promise.resolve(featureRequest);
    }

    await this.featuresRepository.save(feature);
    const savedFeature = await this.featuresRepository.findOneByOrFail({
      id: feature.id,
    });

    if (featureDto.files) {
      await this.addFeatureFiles(featureDto, feature);
    }

    const createdFeature = await FeatureMapper.toDto(savedFeature);
    this.eventEmitter.emit('feature.created', createdFeature);
    const mentions = await savedFeature.mentions;
    if (mentions.length > 0) {
      const notification: CreateNotificationDto = {
        mentions,
        org,
        project,
        createdBy: user,
        action: ActionType.CREATE,
        entity: EntityType.INITIATIVE_DESCRIPTION,
        status: StatusType.UNREAD,
        entityId: savedFeature.id,
      };
      this.eventEmitter.emit('mention.created', notification);
    }
    return createdFeature;
  }

  async listFeatures(
    orgId: string,
    projectId: string,
    page: number = 1,
    limit: number = 0,
  ) {
    let query = `
            SELECT *
            FROM feature
            WHERE feature."orgId" = $1
              AND feature."projectId" = $2
            ORDER BY CASE
                         WHEN feature."priority" = 'high' THEN 1
                         WHEN feature."priority" = 'medium' THEN 2
                         WHEN feature."priority" = 'low' THEN 3
                         ELSE 4
                         END,
                     feature."createdAt" DESC
        `;
    let params = [orgId, projectId] as any[];
    if (limit > 0) {
      query += ' OFFSET $3 LIMIT $4';
      const offset = (page - 1) * limit;
      params = [orgId, projectId, offset, limit];
    }

    const features = await this.featuresRepository.query(query, params);
    return await FeatureMapper.toListDtoWithoutAssignees(features);
  }

  async listFeaturesWithoutMilestone(orgId: string, projectId: string) {
    const features = await this.featuresRepository
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

    return await FeatureMapper.toListDto(features);
  }

  async getFeature(orgId: string, projectId: string, id: string) {
    const feature = await this.featuresRepository.findOneByOrFail({
      org: { id: orgId },
      project: { id: projectId },
      id: id,
    });
    return await FeatureMapper.toDto(feature);
  }

  async updateFeature(
    userId: string,
    orgId: string,
    projectId: string,
    id: string,
    updateFeatureDto: CreateUpdateFeatureDto,
  ) {
    this.validateFeature(updateFeatureDto);
    const feature = await this.featuresRepository.findOneByOrFail({
      org: { id: orgId },
      project: { id: projectId },
      id: id,
    });
    const originalFeature = await FeatureMapper.toDto(feature);

    feature.title = updateFeatureDto.title;
    feature.description = updateFeatureDto.description;
    feature.priority = updateFeatureDto.priority;
    feature.status = updateFeatureDto.status;
    feature.mentions = Promise.resolve(
      await this.usersRepository.findBy({
        id: In(updateFeatureDto.mentions),
      }),
    );

    if (updateFeatureDto.status === FeatureStatus.COMPLETED) {
      feature.completedAt = new Date();
    }

    await this.updateFeatureKeyResult(
      updateFeatureDto,
      orgId,
      projectId,
      feature,
    );

    await this.updateFeatureFeatureRequest(
      updateFeatureDto,
      orgId,
      projectId,
      feature,
    );

    await this.updateFeatureMilestone(
      updateFeatureDto,
      orgId,
      projectId,
      feature,
    );

    await this.updateFeatureFiles(updateFeatureDto, feature);

    await this.updateFeatureAssignedTo(updateFeatureDto, orgId, feature);

    const savedFeature = await this.featuresRepository.save(feature);
    const updatedFeature = await FeatureMapper.toDto(savedFeature);
    this.eventEmitter.emit('feature.updated', {
      previous: originalFeature,
      current: updatedFeature,
    });
    const mentions = await savedFeature.mentions;
    if (mentions.length > 0) {
      const notification: CreateNotificationDto = {
        mentions,
        createdBy: await this.userRepository.findOneByOrFail({ id: userId }),
        org: await savedFeature.org,
        project: await savedFeature.project,
        action: ActionType.UPDATE,
        entity: EntityType.INITIATIVE_DESCRIPTION,
        status: StatusType.UNREAD,
        entityId: savedFeature.id,
      };
      this.eventEmitter.emit('mention.created', notification);
    }
    return updatedFeature;
  }

  async deleteFeature(orgId: string, projectId: string, id: string) {
    const feature = await this.featuresRepository.findOneByOrFail({
      org: { id: orgId },
      project: { id: projectId },
      id: id,
    });
    const deletedFeature = await FeatureMapper.toDto(feature);
    await this.deleteFeatureFiles(orgId, projectId, feature.id);
    await this.workItemsService.removeFeatureFromWorkItems(
      orgId,
      projectId,
      id,
    );
    await this.featuresRepository.remove(feature);
    this.eventEmitter.emit('feature.deleted', deletedFeature);
  }

  async patchFeature(
    orgId: string,
    projectId: string,
    featureId: string,
    patchFeatureDto: PatchFeatureDto,
  ) {
    const feature = await this.featuresRepository.findOneByOrFail({
      org: { id: orgId },
      project: { id: projectId },
      id: featureId,
    });
    const originalFeature = await FeatureMapper.toDto(feature);
    this.patchFeatureStatus(patchFeatureDto, feature);
    this.patchFeaturePriority(patchFeatureDto, feature);
    await this.patchFeatureMilestone(
      patchFeatureDto,
      orgId,
      projectId,
      feature,
    );
    await this.patchFeatureKeyResult(
      patchFeatureDto,
      orgId,
      projectId,
      feature,
    );
    await this.patchFeatureFeatureRequest(
      patchFeatureDto,
      orgId,
      projectId,
      feature,
    );
    const savedFeature = await this.featuresRepository.save(feature);
    const updatedFeature = await FeatureMapper.toDto(savedFeature);
    this.eventEmitter.emit('feature.updated', {
      previous: originalFeature,
      current: updatedFeature,
    });
    return updatedFeature;
  }

  async searchFeatures(
    orgId: string,
    projectId: string,
    search: string,
    page: number = 1,
    limit: number = 0,
    filters?: FilterOptions,
  ) {
    if (this.isReference(search)) {
      const queryBuilder = new FeatureQueryBuilder(
        orgId,
        projectId,
        { reference: search },
        this.featuresRepository,
        filters,
      );
      return queryBuilder.execute(page, limit);
    }

    const queryBuilder = new FeatureQueryBuilder(
      orgId,
      projectId,
      { term: search },
      this.featuresRepository,
      filters,
    );

    return queryBuilder.execute(page, limit);
  }

  async listFeatureComments(featureId: string) {
    const feature = await this.featuresRepository.findOneByOrFail({
      id: featureId,
    });

    const comments = await feature.comments;
    return await CommentMapper.toDtoList(comments);
  }

  async createFeatureComment(
    userId: string,
    featureId: string,
    createCommentDto: CreateUpdateCommentDto,
  ) {
    const user = await this.usersRepository.findOneByOrFail({ id: userId });
    const feature = await this.featuresRepository.findOneByOrFail({
      id: featureId,
    });

    const org = await feature.org;

    if (!createCommentDto.content || createCommentDto.content.trim() === '') {
      throw new Error('Comment content is required');
    }
    const comment = new FeatureComment();
    comment.content = createCommentDto.content;
    comment.createdBy = Promise.resolve(user);
    comment.org = Promise.resolve(org);
    comment.feature = Promise.resolve(feature);
    comment.mentions = Promise.resolve(
      await this.usersRepository.findBy({
        id: In(createCommentDto.mentions),
      }),
    );
    const savedComment = await this.featureCommentsRepository.save(comment);
    const mentions = await savedComment.mentions;
    if (mentions.length > 0) {
      const notification: CreateNotificationDto = {
        mentions,
        createdBy: await this.userRepository.findOneByOrFail({ id: userId }),
        org: org,
        project: await feature.project,
        action: ActionType.CREATE,
        entity: EntityType.INITIATIVE_COMMENT,
        status: StatusType.UNREAD,
        entityId: savedComment.id,
      };
      this.eventEmitter.emit('mention.created', notification);
    }
    return CommentMapper.toDto(savedComment);
  }

  async deleteFeatureComment(
    userId: string,
    featureId: string,
    commentId: string,
  ) {
    const comment = await this.featureCommentsRepository.findOneByOrFail({
      id: commentId,
      feature: { id: featureId },
      createdBy: { id: userId },
    });
    await this.featureCommentsRepository.remove(comment);
  }

  async updateFeatureComment(
    userId: string,
    featureId: string,
    commentId: string,
    createCommentDto: CreateUpdateCommentDto,
  ) {
    if (!createCommentDto.content || createCommentDto.content.trim() === '') {
      throw new Error('Comment content is required');
    }
    const comment = await this.featureCommentsRepository.findOneByOrFail({
      id: commentId,
      feature: { id: featureId },
      createdBy: { id: userId },
    });
    comment.content = createCommentDto.content;
    comment.mentions = Promise.resolve(
      await this.usersRepository.findBy({
        id: In(createCommentDto.mentions),
      }),
    );
    const savedComment = await this.featureCommentsRepository.save(comment);
    const mentions = await savedComment.mentions;
    if (mentions.length > 0) {
      const notification: CreateNotificationDto = {
        mentions,
        createdBy: await this.userRepository.findOneByOrFail({ id: userId }),
        org: await savedComment.org,
        project: await (await savedComment.feature).project,
        action: ActionType.UPDATE,
        entity: EntityType.INITIATIVE_COMMENT,
        status: StatusType.UNREAD,
        entityId: savedComment.id,
      };
      this.eventEmitter.emit('mention.created', notification);
    }
    return await CommentMapper.toDto(savedComment);
  }

  private async setFeatureKeyResult(
    featureDto: CreateUpdateFeatureDto,
    org: Org,
    projectId: string,
    feature: Feature,
  ) {
    if (featureDto.keyResult) {
      const keyResult = await this.okrsService.getKeyResultByOrgAndProject(
        org.id,
        projectId,
        featureDto.keyResult,
      );
      feature.keyResult = Promise.resolve(keyResult);
    }
  }

  private async setFeatureAssignedTo(
    featureDto: CreateUpdateFeatureDto,
    org: Org,
    feature: Feature,
  ) {
    if (featureDto.assignedTo) {
      const assignedTo = await this.userRepository.findOneByOrFail({
        id: featureDto.assignedTo,
        org: { id: org.id },
      });
      if (assignedTo) {
        feature.assignedTo = Promise.resolve(assignedTo);
      }
    }
  }

  private async addFeatureFiles(
    featureDto: CreateUpdateFeatureDto,
    feature: Feature,
  ) {
    const files = await this.filesRepository.findBy({
      id: In(featureDto.files.map((file) => file.id)),
    });
    await this.featureFilesRepository.delete({ feature: { id: feature.id } });
    const featureFiles = files.map((file) => {
      const featureFile = new FeatureFile();
      featureFile.feature = Promise.resolve(feature);
      featureFile.file = Promise.resolve(file);
      return featureFile;
    });
    await this.featureFilesRepository.save(featureFiles);
    feature.featureFiles = Promise.resolve(featureFiles);
  }

  private validateFeature(featureDto: CreateUpdateFeatureDto) {
    if (!featureDto.title) throw new Error('Feature title is required');
    if (!featureDto.priority) throw new Error('Feature priority is required');
    if (!featureDto.status) throw new Error('Feature status is required');
    if (!Object.values(Priority).includes(featureDto.priority))
      throw new Error('Invalid priority');
  }

  private async updateFeatureAssignedTo(
    updateFeatureDto: CreateUpdateFeatureDto,
    orgId: string,
    feature: Feature,
  ) {
    if (updateFeatureDto.assignedTo) {
      const assignedTo = await this.userRepository.findOneByOrFail({
        id: updateFeatureDto.assignedTo,
        org: { id: orgId },
      });
      feature.assignedTo = Promise.resolve(assignedTo);
    } else if (await feature.assignedTo) {
      feature.assignedTo = Promise.resolve(null);
    }
  }

  private async updateFeatureFiles(
    updateFeatureDto: CreateUpdateFeatureDto,
    feature: Feature,
  ) {
    if (updateFeatureDto.files) {
      await this.addFeatureFiles(updateFeatureDto, feature);
    } else {
      feature.featureFiles = Promise.resolve([]);
    }
  }

  private async updateFeatureMilestone(
    updateFeatureDto: CreateUpdateFeatureDto,
    orgId: string,
    projectId: string,
    feature: Feature,
  ) {
    if (updateFeatureDto.milestone) {
      const milestone = await this.milestonesService.findOneById(
        orgId,
        projectId,
        updateFeatureDto.milestone,
      );
      feature.milestone = Promise.resolve(milestone);
    } else {
      feature.milestone = Promise.resolve(null);
    }
  }

  private async updateFeatureKeyResult(
    updateFeatureDto: CreateUpdateFeatureDto,
    orgId: string,
    projectId: string,
    feature: Feature,
  ) {
    if (updateFeatureDto.keyResult) {
      const keyResult = await this.okrsService.getKeyResultByOrgAndProject(
        orgId,
        projectId,
        updateFeatureDto.keyResult,
      );
      feature.keyResult = Promise.resolve(keyResult);
    } else {
      feature.keyResult = Promise.resolve(null);
    }
  }

  private async patchFeatureKeyResult(
    patchFeatureDto: PatchFeatureDto,
    orgId: string,
    projectId: string,
    feature: Feature,
  ) {
    if (patchFeatureDto.keyResult) {
      const keyResult = await this.okrsService.getKeyResultByOrgAndProject(
        orgId,
        projectId,
        patchFeatureDto.keyResult,
      );
      feature.keyResult = Promise.resolve(keyResult);
    } else if (
      patchFeatureDto.keyResult === null &&
      (await feature.keyResult)
    ) {
      feature.keyResult = Promise.resolve(null);
    }
  }

  private async patchFeatureMilestone(
    patchFeatureDto: PatchFeatureDto,
    orgId: string,
    projectId: string,
    feature: Feature,
  ) {
    if (patchFeatureDto.milestone) {
      const milestone = await this.milestonesService.findOneById(
        orgId,
        projectId,
        patchFeatureDto.milestone,
      );
      feature.milestone = Promise.resolve(milestone);
    } else if (
      patchFeatureDto.milestone === null &&
      (await feature.milestone)
    ) {
      feature.milestone = Promise.resolve(null);
    }
  }

  private patchFeaturePriority(
    patchFeatureDto: PatchFeatureDto,
    feature: Feature,
  ) {
    if (patchFeatureDto.priority) {
      feature.priority = patchFeatureDto.priority;
    }
  }

  private patchFeatureStatus(
    patchFeatureDto: PatchFeatureDto,
    feature: Feature,
  ) {
    if (patchFeatureDto.status) {
      feature.status = patchFeatureDto.status;
    }
  }

  private async deleteFeatureFiles(
    orgId: string,
    projectId: string,
    id: string,
  ) {
    const featureFiles = await this.featureFilesRepository.findBy({
      feature: { id, org: { id: orgId } },
    });

    for (const featureFile of featureFiles) {
      const file = await featureFile.file;
      await this.filesService.deleteFile(orgId, projectId, file.id);
    }
  }

  private isReference(search: string) {
    return /^[iI]-\d+$/.test(search);
  }

  private async searchFeaturesByTitleOrDescription(
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

    const features = await this.featuresRepository.query(query, params);

    return await FeatureMapper.toListDtoWithoutAssignees(features);
  }

  private async searchFeaturesByReference(
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

    const features = await this.featuresRepository.query(query, params);

    return await FeatureMapper.toListDtoWithoutAssignees(features);
  }

  private async updateFeatureFeatureRequest(
    updateFeatureDto: CreateUpdateFeatureDto,
    orgId: string,
    projectId: string,
    feature: Feature,
  ) {
    if (updateFeatureDto.featureRequest) {
      const featureRequest =
        await this.featureRequestsRepository.findOneByOrFail({
          org: { id: orgId },
          project: { id: projectId },
          id: updateFeatureDto.featureRequest,
        });
      feature.featureRequest = Promise.resolve(featureRequest);
    } else {
      feature.featureRequest = Promise.resolve(null);
    }
  }

  private async patchFeatureFeatureRequest(
    patchFeatureDto: PatchFeatureDto,
    orgId: string,
    projectId: string,
    feature: Feature,
  ) {
    if (patchFeatureDto.featureRequest === null) {
      feature.featureRequest = Promise.resolve(null);
    } else if (patchFeatureDto.featureRequest) {
      const featureRequest =
        await this.featureRequestsRepository.findOneByOrFail({
          org: { id: orgId },
          project: { id: projectId },
          id: patchFeatureDto.featureRequest,
        });
      feature.featureRequest = Promise.resolve(featureRequest);
    } else {
      feature.featureRequest = Promise.resolve(null);
    }
  }
}
