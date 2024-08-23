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
import { PaymentPlan } from '../../auth/payment.plan';
import { CommentMapper } from '../../comments/mappers';
import { CreateUpdateCommentDto } from '../../comments/dtos';
import { FeatureComment } from './feature-comment.entity';

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
  ) {}

  async createFeature(userId: string, featureDto: CreateUpdateFeatureDto) {
    if (!userId) throw new Error('User id is required');
    this.validateFeature(featureDto);
    const user = await this.userRepository.findOneByOrFail({ id: userId });
    const org = await user.org;
    const feature = new Feature();
    feature.title = featureDto.title;
    feature.description = featureDto.description;
    feature.priority = featureDto.priority;
    feature.status = featureDto.status;
    feature.org = Promise.resolve(org);
    feature.createdBy = Promise.resolve(user);
    await this.setFeatureAssignedTo(featureDto, org, feature);
    await this.setFeatureKeyResult(featureDto, org, feature);

    if (featureDto.milestone) {
      const milestone = await this.milestonesService.findOneById(
        org.id,
        featureDto.milestone,
      );
      feature.milestone = Promise.resolve(milestone);
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
    return createdFeature;
  }

  async listFeatures(orgId: string, page: number = 1, limit: number = 0) {
    let query = `
        SELECT *
        FROM feature
        WHERE feature."orgId" = $1
        ORDER BY CASE
                     WHEN feature."priority" = 'high' THEN 1
                     WHEN feature."priority" = 'medium' THEN 2
                     WHEN feature."priority" = 'low' THEN 3
                     ELSE 4
                     END,
                 feature."createdAt" DESC
    `;
    let params = [orgId] as any[];
    if (limit > 0) {
      query += ' OFFSET $2 LIMIT $3';
      const offset = (page - 1) * limit;
      params = [orgId, offset, limit];
    }

    const features = await this.featuresRepository.query(query, params);
    return await FeatureMapper.toListDtoWithoutAssignees(features);
  }

  async listFeaturesWithoutMilestone(orgId: string) {
    const features = await this.featuresRepository
      .createQueryBuilder('feature')
      .leftJoinAndSelect('feature.org', 'org')
      .leftJoinAndSelect('feature.milestone', 'milestone')
      .where('org.id = :orgId', { orgId })
      .andWhere('milestone.id IS NULL')
      .andWhere('feature.status not in (:...status)', {
        status: ['closed', 'completed'],
      })
      .getMany();

    return await FeatureMapper.toListDto(features);
  }

  async getFeature(orgId: string, id: string) {
    const feature = await this.featuresRepository.findOneByOrFail({
      org: { id: orgId },
      id: id,
    });
    return await FeatureMapper.toDto(feature);
  }

  async updateFeature(
    orgId: string,
    id: string,
    updateFeatureDto: CreateUpdateFeatureDto,
  ) {
    this.validateFeature(updateFeatureDto);
    const feature = await this.featuresRepository.findOneByOrFail({
      org: { id: orgId },
      id: id,
    });
    const originalFeature = await FeatureMapper.toDto(feature);

    feature.title = updateFeatureDto.title;
    feature.description = updateFeatureDto.description;
    feature.priority = updateFeatureDto.priority;
    feature.status = updateFeatureDto.status;

    await this.updateFeatureKeyResult(updateFeatureDto, orgId, feature);

    await this.updateFeatureMilestone(updateFeatureDto, orgId, feature);

    await this.updateFeatureFiles(updateFeatureDto, feature);

    await this.updateFeatureAssignedTo(updateFeatureDto, orgId, feature);

    const savedFeature = await this.featuresRepository.save(feature);
    const updatedFeature = await FeatureMapper.toDto(savedFeature);
    this.eventEmitter.emit('feature.updated', {
      previous: originalFeature,
      current: updatedFeature,
    });
    return updatedFeature;
  }

  async deleteFeature(orgId: string, id: string) {
    const feature = await this.featuresRepository.findOneByOrFail({
      org: { id: orgId },
      id: id,
    });
    const deletedFeature = await FeatureMapper.toDto(feature);
    await this.deleteFeatureFiles(orgId, feature.id);
    await this.workItemsService.removeFeatureFromWorkItems(orgId, id);
    await this.featuresRepository.remove(feature);
    this.eventEmitter.emit('feature.deleted', deletedFeature);
  }

  async patchFeature(
    orgId: string,
    featureId: string,
    patchFeatureDto: PatchFeatureDto,
  ) {
    const feature = await this.featuresRepository.findOneByOrFail({
      org: { id: orgId },
      id: featureId,
    });
    const originalFeature = await FeatureMapper.toDto(feature);
    this.patchFeatureStatus(patchFeatureDto, feature);
    this.patchFeaturePriority(patchFeatureDto, feature);
    await this.patchFeatureMilestone(patchFeatureDto, orgId, feature);
    await this.patchFeatureKeyResult(patchFeatureDto, orgId, feature);
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
    search: string,
    page: number = 1,
    limit: number = 0,
  ) {
    if (!search) return [];

    if (this.isReference(search)) {
      return await this.searchFeaturesByReference(orgId, search, page, limit);
    }

    return await this.searchFeaturesByTitleOrDescription(
      orgId,
      search,
      page,
      limit,
    );
  }

  async listFeatureComments(featureId: string) {
    const feature = await this.featuresRepository.findOneByOrFail({
      id: featureId,
    });
    const org = await feature.org;
    if (org.paymentPlan !== PaymentPlan.PREMIUM) {
      throw new Error('You need to upgrade to premium to access comments');
    }
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
    if (org.paymentPlan !== PaymentPlan.PREMIUM) {
      throw new Error('You need to upgrade to premium to add comments');
    }
    if (!createCommentDto.content || createCommentDto.content.trim() === '') {
      throw new Error('Comment content is required');
    }
    const comment = new FeatureComment();
    comment.content = createCommentDto.content;
    comment.createdBy = Promise.resolve(user);
    comment.org = Promise.resolve(org);
    comment.feature = Promise.resolve(feature);
    const savedComment = await this.featureCommentsRepository.save(comment);
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
    const feature = await this.featuresRepository.findOneByOrFail({
      id: featureId,
    });
    const org = await feature.org;
    if (org.paymentPlan !== PaymentPlan.PREMIUM) {
      throw new Error('You need to upgrade to premium to add comments');
    }
    if (!createCommentDto.content || createCommentDto.content.trim() === '') {
      throw new Error('Comment content is required');
    }
    const comment = await this.featureCommentsRepository.findOneByOrFail({
      id: commentId,
      feature: { id: featureId },
      createdBy: { id: userId },
    });
    comment.content = createCommentDto.content;
    const savedComment = await this.featureCommentsRepository.save(comment);
    return await CommentMapper.toDto(savedComment);
  }

  private async setFeatureKeyResult(
    featureDto: CreateUpdateFeatureDto,
    org: Org,
    feature: Feature,
  ) {
    if (featureDto.keyResult) {
      const keyResult = await this.okrsService.getKeyResultByOrgId(
        org.id,
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
    feature: Feature,
  ) {
    if (updateFeatureDto.milestone) {
      const milestone = await this.milestonesService.findOneById(
        orgId,
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
    feature: Feature,
  ) {
    if (updateFeatureDto.keyResult) {
      const keyResult = await this.okrsService.getKeyResultByOrgId(
        orgId,
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
    feature: Feature,
  ) {
    if (patchFeatureDto.keyResult) {
      const keyResult = await this.okrsService.getKeyResultByOrgId(
        orgId,
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
    feature: Feature,
  ) {
    if (patchFeatureDto.milestone) {
      const milestone = await this.milestonesService.findOneById(
        orgId,
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

  private async deleteFeatureFiles(orgId: string, id: string) {
    const featureFiles = await this.featureFilesRepository.findBy({
      feature: { id, org: { id: orgId } },
    });

    for (const featureFile of featureFiles) {
      const file = await featureFile.file;
      await this.filesService.deleteFile(orgId, file.id);
    }
  }

  private isReference(search: string) {
    return /^[fF]-\d+$/.test(search);
  }

  private async searchFeaturesByTitleOrDescription(
    orgId: string,
    search: string,
    page: number,
    limit: number,
  ) {
    let query = `
        SELECT *
        FROM feature
        WHERE feature."orgId" = $1
          AND (feature.title ILIKE $2 OR feature.description ILIKE $2)
        ORDER BY CASE
                     WHEN feature."priority" = 'high' THEN 1
                     WHEN feature."priority" = 'medium' THEN 2
                     WHEN feature."priority" = 'low' THEN 3
                     ELSE 4
                     END,
                 feature."createdAt" DESC
    `;
    let params = [orgId, `%${search}%`] as any[];

    if (limit > 0) {
      query += ' OFFSET $3 LIMIT $4';
      const offset = (page - 1) * limit;
      params = [orgId, `%${search}%`, offset, limit];
    }

    const features = await this.featuresRepository.query(query, params);

    return await FeatureMapper.toListDtoWithoutAssignees(features);
  }

  private async searchFeaturesByReference(
    orgId: string,
    search: string,
    page: number,
    limit: number,
  ) {
    let query = `
        SELECT *
        FROM feature
        WHERE feature."orgId" = $1
          AND CAST(feature."sequenceNumber" AS TEXT) LIKE $2
        ORDER BY CASE
                     WHEN feature."priority" = 'high' THEN 1
                     WHEN feature."priority" = 'medium' THEN 2
                     WHEN feature."priority" = 'low' THEN 3
                     ELSE 4
                     END,
                 feature."createdAt" DESC
    `;

    const referenceSequenceNumber = search.split('-')[1];
    let params = [orgId, `${referenceSequenceNumber}%`] as any[];

    if (limit > 0) {
      query += ' OFFSET $3 LIMIT $4';
      const offset = (page - 1) * limit;
      params = [orgId, `${referenceSequenceNumber}%`, offset, limit];
    }

    const features = await this.featuresRepository.query(query, params);

    return await FeatureMapper.toListDtoWithoutAssignees(features);
  }
}
