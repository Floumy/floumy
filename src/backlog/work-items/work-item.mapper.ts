import { WorkItem } from "./work-item.entity";
import { WorkItemDto } from "./dtos";
import { Feature } from "../../roadmap/features/feature.entity";
import { Iteration } from "../../iterations/Iteration.entity";

class FeatureMapper {
  static toDto(feature: Feature) {
    return {
      id: feature.id,
      title: feature.title
    };
  }
}

class IterationMapper {
  static toDto(iteration: Iteration) {
    return {
      id: iteration.id,
      title: iteration.title
    };
  }
}

export default class WorkItemMapper {
  static async toDto(workItem: WorkItem): Promise<WorkItemDto> {
    const feature = await workItem.feature;
    const iteration = await workItem.iteration;
    return {
      id: workItem.id,
      title: workItem.title,
      description: workItem.description,
      priority: workItem.priority,
      type: workItem.type,
      status: workItem.status,
      estimation: workItem.estimation,
      feature: feature ? FeatureMapper.toDto(feature) : undefined,
      iteration: iteration ? IterationMapper.toDto(iteration) : undefined,
      completedAt: workItem.completedAt,
      createdAt: workItem.createdAt,
      updatedAt: workItem.updatedAt
    };
  }

  static async toListDto(workItems: WorkItem[]) {
    return await Promise.all(workItems.map(this.toDto));
  }
}
