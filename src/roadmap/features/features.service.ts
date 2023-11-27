import { Injectable } from "@nestjs/common";
import { CreateFeatureDto } from "./dtos";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Feature } from "./feature.entity";
import { Org } from "../../orgs/org.entity";
import { FeatureMapper } from "./feature.mapper";
import { Timeline } from "../../common/timeline.enum";
import { Priority } from "../../common/priority.enum";
import { KeyResult } from "../../okrs/key-result.entity";

@Injectable()
export class FeaturesService {

  constructor(
    @InjectRepository(Feature) private featureRepository: Repository<Feature>,
    @InjectRepository(Org) private orgRepository: Repository<Org>,
    @InjectRepository(KeyResult) private keyResultRepository: Repository<KeyResult>
  ) {
  }

  async createFeature(orgId: any, featureDto: CreateFeatureDto) {
    this.validateFeature(featureDto);
    const org = await this.orgRepository.findOneByOrFail({ id: orgId });
    const feature = new Feature();
    feature.title = featureDto.title;
    feature.description = featureDto.description;
    feature.timeline = featureDto.timeline;
    feature.priority = featureDto.priority;
    feature.org = Promise.resolve(org);
    if (featureDto.keyResult) {
      const keyResult = await this.keyResultRepository.findOneByOrFail({ id: featureDto.keyResult, org: { id: orgId } });
      feature.keyResult = Promise.resolve(keyResult);
    }
    const savedFeature = await this.featureRepository.save(feature);
    return await FeatureMapper.toDto(savedFeature);
  }

  private validateFeature(featureDto: CreateFeatureDto) {
    if (!featureDto.title) throw new Error("Feature title is required");
    if (!featureDto.description) throw new Error("Feature description is required");
    if (!featureDto.timeline) throw new Error("Feature timeline is required");
    if (!featureDto.priority) throw new Error("Feature priority is required");
    if (!Object.values(Timeline).includes(featureDto.timeline)) throw new Error("Invalid timeline");
    if (!Object.values(Priority).includes(featureDto.priority)) throw new Error("Invalid priority");
  }
}
