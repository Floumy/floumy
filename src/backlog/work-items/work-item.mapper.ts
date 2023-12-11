import { WorkItem } from "./work-item.entity";
import { WorkItemDto } from "./dtos";
import { Feature } from "../../roadmap/features/feature.entity";

class FeatureMapper {
  static toDto(feature: Feature) {
    return {
      id: feature.id,
      title: feature.title
    };
  }
}

export default class WorkItemMapper {
  static async toDto(workItem: WorkItem): Promise<WorkItemDto> {
    return {
      id: workItem.id,
      title: workItem.title,
      description: workItem.description,
      priority: workItem.priority,
      type: workItem.type,
      status: workItem.status,
      feature: FeatureMapper.toDto(await workItem.feature),
      createdAt: workItem.createdAt,
      updatedAt: workItem.updatedAt
    };
  }
}
