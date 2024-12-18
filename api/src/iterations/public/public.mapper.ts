import { Iteration } from '../Iteration.entity';
import { TimelineService } from '../../common/timeline.service';
import { WorkItem } from '../../backlog/work-items/work-item.entity';

function formatDate(date: Date) {
  if (!date) return null;
  return date.toISOString().split('T')[0];
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
      workItems: await Promise.all(workItems.map(WorkItemMapper.toDto)),
      velocity: iteration.velocity,
      duration: iteration.duration,
      createdAt: iteration.createdAt,
      updatedAt: iteration.updatedAt,
      status: iteration.status,
    };
  }
}

class WorkItemMapper {
  static async toDto(workItem: WorkItem) {
    const feature = await workItem.feature;
    const iteration = await workItem.iteration;
    return {
      id: workItem.id,
      reference: workItem.reference,
      title: workItem.title,
      description: workItem.description,
      priority: workItem.priority,
      type: workItem.type,
      status: workItem.status,
      estimation: workItem.estimation,
      iteration: iteration
        ? {
            id: iteration.id,
            title: iteration.title,
          }
        : null,
      feature: feature
        ? {
            id: feature.id,
            title: feature.title,
          }
        : null,
      completedAt: workItem.completedAt,
      createdAt: workItem.createdAt,
      updatedAt: workItem.updatedAt,
    };
  }
}
