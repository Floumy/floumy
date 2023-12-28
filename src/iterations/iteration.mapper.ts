import { Iteration } from "./Iteration.entity";
import { TimelineService } from "../common/timeline.service";
import { WorkItem } from "../backlog/work-items/work-item.entity";

function formatDate(date: Date) {
  if (!date) return null;
  return date.toISOString().split("T")[0];
}

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
      completedAt: workItem.completedAt,
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
      startDate: formatDate(iteration.startDate),
      endDate: formatDate(iteration.endDate),
      actualStartDate: formatDate(iteration.actualStartDate),
      actualEndDate: formatDate(iteration.actualEndDate),
      timeline: TimelineService.convertDateToTimeline(iteration.startDate),
      workItems: workItems.map(WorkItemMapper.toDto),
      duration: iteration.duration,
      createdAt: iteration.createdAt,
      updatedAt: iteration.updatedAt,
      status: iteration.status
    };
  }
}
