import { Feature } from './feature.entity';
import { FeatureDto, FeaturesListDto } from './dtos';
import { CommentMapper } from '../../comments/mappers';

export class FeatureMapper {
  static async toDto(feature: Feature): Promise<FeatureDto> {
    const createdBy = await feature.createdBy;
    const assignedTo = await feature.assignedTo;
    const org = await feature.org;
    const comments = await feature.comments;
    const featureRequest = await feature.featureRequest;
    const project = await feature.project;

    const featureDto = {
      id: feature.id,
      org: {
        id: org.id,
        name: org.name,
      },
      project: {
        id: project.id,
      },
      reference: feature.reference,
      title: feature.title,
      description: feature.description,
      priority: feature.priority,
      status: feature.status,
      progress: feature.progress,
      workItemsCount: feature.workItemsCount,
      workItems: (await feature.workItems).map(WorkItemMapper.toDto),
      comments: await CommentMapper.toDtoList(comments),
      featureRequest: featureRequest
        ? {
            id: featureRequest.id,
            title: featureRequest.title,
          }
        : null,
      files: await Promise.all(
        (await feature.featureFiles).map(async (featureFile) => {
          const file = await featureFile.file;
          return {
            id: file.id,
            name: file.name,
            size: file.size,
            type: file.type,
          };
        }),
      ),
      createdBy: createdBy
        ? {
            id: createdBy.id,
            name: createdBy.name,
          }
        : undefined,
      assignedTo: assignedTo
        ? {
            id: assignedTo.id,
            name: assignedTo.name,
          }
        : undefined,
      createdAt: feature.createdAt,
      updatedAt: feature.updatedAt,
    };
    const featureKeyResult = await feature.keyResult;
    if (featureKeyResult) {
      featureDto['keyResult'] = {
        id: featureKeyResult.id,
        title: featureKeyResult.title,
      };
    }
    const featureMilestone = await feature.milestone;
    if (featureMilestone) {
      featureDto['milestone'] = {
        id: featureMilestone.id,
        title: featureMilestone.title,
        dueDate: featureMilestone.dueDate,
      };
    }
    return featureDto;
  }

  static async toListDtoWithoutAssignees(
    features: Feature[],
  ): Promise<FeaturesListDto[]> {
    return await Promise.all(
      features.map(FeatureMapper.toListItemDtoWithoutAssignees),
    );
  }

  static async toListDto(features: Feature[]): Promise<FeaturesListDto[]> {
    return await Promise.all(features.map(FeatureMapper.toListItemDto));
  }

  static async toListItemDto(feature: Feature): Promise<FeaturesListDto> {
    const assignedTo = await feature.assignedTo;
    return {
      id: feature.id,
      reference: feature.reference,
      title: feature.title,
      priority: feature.priority,
      status: feature.status,
      progress: feature.progress,
      workItemsCount: feature.workItemsCount,
      assignedTo: assignedTo
        ? {
            id: assignedTo.id,
            name: assignedTo.name,
          }
        : null,
      createdAt: feature.createdAt,
      updatedAt: feature.updatedAt,
    };
  }

  static async toListItemDtoWithoutAssignees(
    feature: Feature,
  ): Promise<FeaturesListDto> {
    return {
      id: feature.id,
      reference: feature.reference,
      title: feature.title,
      priority: feature.priority,
      status: feature.status,
      progress: feature.progress,
      workItemsCount: feature.workItemsCount,
      createdAt: feature.createdAt,
      updatedAt: feature.updatedAt,
    };
  }
}

class WorkItemMapper {
  static toDto(workItem: any): any {
    return {
      id: workItem.id,
      reference: workItem.reference,
      title: workItem.title,
      description: workItem.description,
      priority: workItem.priority,
      status: workItem.status,
      type: workItem.type,
      estimation: workItem.estimation,
      createdAt: workItem.createdAt,
      updatedAt: workItem.updatedAt,
    };
  }
}
