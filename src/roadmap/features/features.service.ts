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
import { TimelineService } from "../../common/timeline.service";

@Injectable()
export class FeaturesService {

  constructor(
    @InjectRepository(Feature) private featuresRepository: Repository<Feature>,
    private orgsService: OrgsService,
    private okrsService: OkrsService,
    private milestonesService: MilestonesService
  ) {
  }

  async createFeature(orgId: any, featureDto: CreateUpdateFeatureDto) {
    this.validateFeature(featureDto);
    const org = await this.orgsService.findOneById(orgId);
    const feature = new Feature();
    feature.title = featureDto.title;
    feature.description = featureDto.description;
    feature.priority = featureDto.priority;
    feature.org = Promise.resolve(org);
    TimelineService.validateTimeline(featureDto.timeline);
    const { startDate, endDate } = TimelineService.getStartAndEndDatesByTimelineValue(featureDto.timeline);
    feature.startDate = startDate;
    feature.endDate = endDate;
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
    if (!Object.values(Priority).includes(featureDto.priority)) throw new Error("Invalid priority");
    TimelineService.validateTimeline(featureDto.timeline);
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
      .getMany();

    return FeatureMapper.toListDto(features);
  }

  async get(orgId: string, id: string) {
    const feature = await this.featuresRepository.findOneByOrFail({ org: { id: orgId }, id: id });
    return await FeatureMapper.toDto(feature);
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
    const { startDate, endDate } = TimelineService.getStartAndEndDatesByTimelineValue(updateFeatureDto.timeline);
    feature.startDate = startDate;
    feature.endDate = endDate;

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
    await this.featuresRepository.remove(feature);
  }
}
