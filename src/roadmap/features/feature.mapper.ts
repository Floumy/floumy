import { Feature } from "./feature.entity";
import { FeatureDto, FeaturesListDto } from "./dtos";

export class FeatureMapper {
  static async toDto(feature: Feature): Promise<FeatureDto> {
    const featureDto = {
      id: feature.id,
      title: feature.title,
      description: feature.description,
      priority: feature.priority,
      status: feature.status,
      timeline: feature.timeline,
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
    return featureDto;
  }

  static toListDto(features: Feature[]): FeaturesListDto[] {
    return features.map(feature => ({
      id: feature.id,
      title: feature.title,
      priority: feature.priority,
      status: feature.status,
      timeline: feature.timeline,
      createdAt: feature.createdAt,
      updatedAt: feature.updatedAt
    }));
  }
}
