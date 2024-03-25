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
    if (featureDto.assignedTo) {
      const assignedTo = await this.userRepository.findOneByOrFail({
        id: featureDto.assignedTo,
        org: { id: org.id },
      });
      if (assignedTo) {
        feature.assignedTo = Promise.resolve(assignedTo);
      }
    }

    if (featureDto.keyResult) {
      const keyResult = await this.okrsService.getKeyResultByOrgId(
        org.id,
        featureDto.keyResult,
      );
      feature.keyResult = Promise.resolve(keyResult);
    }

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
      await this.addFiles(featureDto, feature);
    }

    return await FeatureMapper.toDto(savedFeature);
  }

  private async addFiles(featureDto: CreateUpdateFeatureDto, feature: Feature) {
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

  async listFeatures(orgId: string) {
    const features = await this.featuresRepository.findBy({
      org: { id: orgId },
    });
    return await FeatureMapper.toListDto(features);
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
    feature.title = updateFeatureDto.title;
    feature.description = updateFeatureDto.description;
    feature.priority = updateFeatureDto.priority;
    feature.status = updateFeatureDto.status;

    if (updateFeatureDto.keyResult) {
      const keyResult = await this.okrsService.getKeyResultByOrgId(
        orgId,
        updateFeatureDto.keyResult,
      );
      feature.keyResult = Promise.resolve(keyResult);
    } else {
      feature.keyResult = Promise.resolve(null);
    }

    if (updateFeatureDto.milestone) {
      const milestone = await this.milestonesService.findOneById(
        orgId,
        updateFeatureDto.milestone,
      );
      feature.milestone = Promise.resolve(milestone);
    } else {
      feature.milestone = Promise.resolve(null);
    }

    if (updateFeatureDto.files) {
      await this.addFiles(updateFeatureDto, feature);
    } else {
      feature.featureFiles = Promise.resolve([]);
    }

    if (updateFeatureDto.assignedTo) {
      const assignedTo = await this.userRepository.findOneByOrFail({
        id: updateFeatureDto.assignedTo,
        org: { id: orgId },
      });
      feature.assignedTo = Promise.resolve(assignedTo);
    } else if (feature.assignedTo) {
      feature.assignedTo = Promise.resolve(null);
    }

    const savedFeature = await this.featuresRepository.save(feature);
    return await FeatureMapper.toDto(savedFeature);
  }

  async deleteFeature(orgId: string, id: string) {
    const feature = await this.featuresRepository.findOneByOrFail({
      org: { id: orgId },
      id: id,
    });
    await this.deleteFeatureFiles(orgId, feature.id);
    await this.workItemsService.removeFeatureFromWorkItems(orgId, id);
    await this.featuresRepository.remove(feature);
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
    if (patchFeatureDto.status) {
      feature.status = patchFeatureDto.status;
    }
    if (patchFeatureDto.priority) {
      feature.priority = patchFeatureDto.priority;
    }
    if (patchFeatureDto.milestone) {
      const milestone = await this.milestonesService.findOneById(
        orgId,
        patchFeatureDto.milestone,
      );
      feature.milestone = Promise.resolve(milestone);
    } else if (patchFeatureDto.milestone === null && feature.milestone) {
      feature.milestone = Promise.resolve(null);
    }
    const savedFeature = await this.featuresRepository.save(feature);
    return await FeatureMapper.toDto(savedFeature);
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
}
