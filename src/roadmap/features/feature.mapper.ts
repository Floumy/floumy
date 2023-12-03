import { Feature } from "./feature.entity";
import { FeatureDto, FeaturesListDto } from "./dtos";
import { TimelineService } from "../../common/timeline.service";

export class FeatureMapper {
  static async toDto(feature: Feature): Promise<FeatureDto> {
    const featureDto = {
      id: feature.id,
      title: feature.title,
      description: feature.description,
      priority: feature.priority,
      timeline: TimelineService.startAndEndDatesToTimeline(feature.startDate, feature.endDate),
      status: feature.status,
      createdAt: feature.createdAt,
      updatedAt: feature.updatedAt
    };
    const featureKeyResult = await feature.keyResult;
    if (featureKeyResult) {
      featureDto["keyResult"] = {
        id: featureKeyResult.id,
        title: featureKeyResult.title
      };
    }
    const featureMilestone = await feature.milestone;
    if (featureMilestone) {
      featureDto["milestone"] = {
        id: featureMilestone.id,
        title: featureMilestone.title
      };
    }
    return featureDto;
  }

  static toListDto(features: Feature[]): FeaturesListDto[] {
    return features.map(feature => ({
      id: feature.id,
      title: feature.title,
      priority: feature.priority,
      status: feature.status,
      timeline: TimelineService.startAndEndDatesToTimeline(feature.startDate, feature.endDate),
      createdAt: feature.createdAt,
      updatedAt: feature.updatedAt
    }));
  }
}
