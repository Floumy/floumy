import { Feature } from "./feature.entity";
import { FeatureDto, FeaturesListDto } from "./dtos";

export class FeatureMapper {
  static async toDto(feature: Feature): Promise<FeatureDto> {
    const createdBy = await feature.createdBy;
    const featureDto = {
      id: feature.id,
      title: feature.title,
      description: feature.description,
      priority: feature.priority,
      status: feature.status,
      progress: feature.progress,
      workItemsCount: feature.workItemsCount,
      workItems: (await feature.workItems).map(WorkItemMapper.toDto),
      files: await Promise.all((await feature.featureFiles).map(async featureFile => {
        const file = await featureFile.file;
        return {
          id: file.id,
          name: file.name,
          size: file.size,
          type: file.type
        };
      })),
      createdBy: createdBy ? {
        id: createdBy.id,
        name: createdBy.name
      } : undefined,
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
      progress: feature.progress,
      workItemsCount: feature.workItemsCount,
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
