import { Injectable } from "@nestjs/common";
import { CreateFeatureDto } from "./dtos";
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
    @InjectRepository(Feature) private featureRepository: Repository<Feature>,
    private orgsService: OrgsService,
    private okrsService: OkrsService,
    private milestonesService: MilestonesService
  ) {
  }

  async createFeature(orgId: any, featureDto: CreateFeatureDto) {
    this.validateFeature(featureDto);
    const org = await this.orgsService.findOneById(orgId);
    const feature = new Feature();
    feature.title = featureDto.title;
    feature.description = featureDto.description;
    feature.priority = featureDto.priority;
    feature.org = Promise.resolve(org);

    if (featureDto.timeline) {
      TimelineService.validateTimeline(featureDto.timeline);
      const { startDate, endDate } = TimelineService.getStartAndEndDatesByTimelineValue(featureDto.timeline);
      feature.startDate = startDate;
      feature.endDate = endDate;
    }

    if (featureDto.keyResult) {
      const keyResult = await this.okrsService.getKeyResultByOrgId(orgId, featureDto.keyResult);
      feature.keyResult = Promise.resolve(keyResult);
    }

    if (featureDto.milestone) {
      const milestone = await this.milestonesService.findOneById(orgId, featureDto.milestone);
      feature.milestone = Promise.resolve(milestone);
    }
    const savedFeature = await this.featureRepository.save(feature);
    return await FeatureMapper.toDto(savedFeature);
  }

  private validateFeature(featureDto: CreateFeatureDto) {
    if (!featureDto.title) throw new Error("Feature title is required");
    if (!featureDto.priority) throw new Error("Feature priority is required");
    if (!Object.values(Priority).includes(featureDto.priority)) throw new Error("Invalid priority");
  }

  async listFeatures(orgId: string) {
    const features = await this.featureRepository.findBy({ org: { id: orgId } });
    return FeatureMapper.toListDto(features);
  }

  async listFeaturesWithoutMilestone(orgId: string) {
    const features = await this.featureRepository.findBy({ org: { id: orgId }, milestone: null });
    return FeatureMapper.toListDto(features);
  }
}
