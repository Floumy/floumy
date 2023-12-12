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
    const feature = await workItem.feature;
    return {
      id: workItem.id,
      title: workItem.title,
      description: workItem.description,
      priority: workItem.priority,
      type: workItem.type,
      status: workItem.status,
      feature: feature ? FeatureMapper.toDto(feature) : undefined,
      createdAt: workItem.createdAt,
      updatedAt: workItem.updatedAt
    };
  }

  static async toListDto(workItems: WorkItem[]) {
    return await Promise.all(workItems.map(this.toDto));
  }
}
