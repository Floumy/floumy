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
      workItems: (await feature.workItems).map(WorkItemMapper.toDto),
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
        title: featureMilestone.title,
        dueDate: featureMilestone.dueDate
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
      createdAt: feature.createdAt,
      updatedAt: feature.updatedAt
    }));
  }
}

class WorkItemMapper {
  static toDto(workItem: any): any {
    return {
      id: workItem.id,
      title: workItem.title,
      description: workItem.description,
      priority: workItem.priority,
      status: workItem.status,
      type: workItem.type,
      estimation: workItem.estimation,
      createdAt: workItem.createdAt,
      updatedAt: workItem.updatedAt
    };
  }
}
