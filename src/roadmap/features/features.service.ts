import { Injectable } from "@nestjs/common";
import { CreateUpdateFeatureDto } from "./dtos";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Feature } from "./feature.entity";
import { FeatureMapper } from "./feature.mapper";
import { Priority } from "../../common/priority.enum";
import { OrgsService } from "../../orgs/orgs.service";
import { OkrsService } from "../../okrs/okrs.service";
import { MilestonesService } from "../milestones/milestones.service";
import { WorkItemsService } from "../../backlog/work-items/work-items.service";

@Injectable()
export class FeaturesService {

  constructor(
    @InjectRepository(Feature) private featuresRepository: Repository<Feature>,
    private orgsService: OrgsService,
    private okrsService: OkrsService,
    private milestonesService: MilestonesService,
    private workItemsService: WorkItemsService
  ) {
  }

  async createFeature(orgId: any, featureDto: CreateUpdateFeatureDto) {
    this.validateFeature(featureDto);
    const org = await this.orgsService.findOneById(orgId);
    const feature = new Feature();
    feature.title = featureDto.title;
    feature.description = featureDto.description;
    feature.priority = featureDto.priority;
    feature.status = featureDto.status;
    feature.org = Promise.resolve(org);

    if (featureDto.keyResult) {
      const keyResult = await this.okrsService.getKeyResultByOrgId(orgId, featureDto.keyResult);
      feature.keyResult = Promise.resolve(keyResult);
    }

    if (featureDto.milestone) {
      const milestone = await this.milestonesService.findOneById(orgId, featureDto.milestone);
      feature.milestone = Promise.resolve(milestone);
    }
    const savedFeature = await this.featuresRepository.save(feature);
    return await FeatureMapper.toDto(savedFeature);
  }

  private validateFeature(featureDto: CreateUpdateFeatureDto) {
    if (!featureDto.title) throw new Error("Feature title is required");
    if (!featureDto.priority) throw new Error("Feature priority is required");
    if (!featureDto.status) throw new Error("Feature status is required");
    if (!Object.values(Priority).includes(featureDto.priority)) throw new Error("Invalid priority");
  }

  async listFeatures(orgId: string) {
    const features = await this.featuresRepository.findBy({ org: { id: orgId } });
    return FeatureMapper.toListDto(features);
  }

  async listFeaturesWithoutMilestone(orgId: string) {
    const features = await this.featuresRepository
      .createQueryBuilder("feature")
      .leftJoinAndSelect("feature.org", "org")
      .leftJoinAndSelect("feature.milestone", "milestone")
      .where("org.id = :orgId", { orgId })
      .andWhere("milestone.id IS NULL")
      .andWhere("feature.status not in (:...status)", { status: ["closed", "completed"] })
      .getMany();

    return FeatureMapper.toListDto(features);
  }

  async getFeature(orgId: string, id: string) {
    const feature = await this.featuresRepository.findOneByOrFail({ org: { id: orgId }, id: id });
    return await FeatureMapper.toDto(feature);
  }

  async updateFeature(orgId: string, id: string, updateFeatureDto: CreateUpdateFeatureDto) {
    this.validateFeature(updateFeatureDto);
    const feature = await this.featuresRepository.findOneByOrFail({ org: { id: orgId }, id: id });
    feature.title = updateFeatureDto.title;
    feature.description = updateFeatureDto.description;
    feature.priority = updateFeatureDto.priority;
    feature.status = updateFeatureDto.status;

    if (updateFeatureDto.keyResult) {
      const keyResult = await this.okrsService.getKeyResultByOrgId(orgId, updateFeatureDto.keyResult);
      feature.keyResult = Promise.resolve(keyResult);
    } else {
      feature.keyResult = Promise.resolve(null);
    }

    if (updateFeatureDto.milestone) {
      const milestone = await this.milestonesService.findOneById(orgId, updateFeatureDto.milestone);
      feature.milestone = Promise.resolve(milestone);
    } else {
      feature.milestone = Promise.resolve(null);
    }

    const savedFeature = await this.featuresRepository.save(feature);
    return await FeatureMapper.toDto(savedFeature);
  }

  async deleteFeature(orgId: string, id: string) {
    const feature = await this.featuresRepository.findOneByOrFail({ org: { id: orgId }, id: id });
    await this.workItemsService.removeFeatureFromWorkItems(orgId, id);
    await this.featuresRepository.remove(feature);
  }
}
