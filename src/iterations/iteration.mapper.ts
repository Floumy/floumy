import { Iteration } from "./Iteration.entity";
import { TimelineService } from "../common/timeline.service";
import { WorkItem } from "../backlog/work-items/work-item.entity";

class WorkItemMapper {
  static toDto(workItem: WorkItem) {
    return {
      id: workItem.id,
      title: workItem.title,
      description: workItem.description,
      priority: workItem.priority,
      type: workItem.type,
      status: workItem.status,
      estimation: workItem.estimation,
      createdAt: workItem.createdAt,
      updatedAt: workItem.updatedAt
    };
  }
}

export class IterationMapper {
  static async toDto(iteration: Iteration) {
    const workItems = await iteration.workItems;
    return {
      id: iteration.id,
      title: iteration.title,
      goal: iteration.goal,
      startDate: iteration.startDate.toISOString().split("T")[0],
      endDate: iteration.endDate.toISOString().split("T")[0],
      timeline: TimelineService.convertDateToTimeline(iteration.startDate),
      workItems: workItems.map(WorkItemMapper.toDto),
      duration: iteration.duration,
      createdAt: iteration.createdAt,
      updatedAt: iteration.updatedAt
    };
  }
}
