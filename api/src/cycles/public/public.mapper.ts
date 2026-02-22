import { Cycle } from '../cycle.entity';
import { TimelineService } from '../../common/timeline.service';
import { WorkItem } from '../../backlog/work-items/work-item.entity';

function formatDate(date: Date) {
  if (!date) return null;
  return date.toISOString().split('T')[0];
}

export class CycleMapper {
  static async toDto(cycle: Cycle) {
    const workItems = await cycle.workItems;
    return {
      id: cycle.id,
      title: cycle.title,
      goal: cycle.goal,
      startDate: formatDate(cycle.startDate),
      endDate: formatDate(cycle.endDate),
      actualStartDate: formatDate(cycle.actualStartDate),
      actualEndDate: formatDate(cycle.actualEndDate),
      timeline: TimelineService.convertDateToTimeline(cycle.startDate),
      workItems: await Promise.all(workItems.map(WorkItemMapper.toDto)),
      velocity: cycle.velocity,
      duration: cycle.duration,
      createdAt: cycle.createdAt,
      updatedAt: cycle.updatedAt,
      status: cycle.status,
    };
  }
}

class WorkItemMapper {
  static async toDto(workItem: WorkItem) {
    const initiative = await workItem.initiative;
    const cycle = await workItem.cycle;
    return {
      id: workItem.id,
      reference: workItem.reference,
      title: workItem.title,
      description: workItem.description,
      priority: workItem.priority,
      type: workItem.type,
      status: workItem.status,
      estimation: workItem.estimation,
      cycle: cycle
        ? {
            id: cycle.id,
            title: cycle.title,
          }
        : null,
      initiative: initiative
        ? {
            id: initiative.id,
            title: initiative.title,
          }
        : null,
      completedAt: workItem.completedAt,
      createdAt: workItem.createdAt,
      updatedAt: workItem.updatedAt,
    };
  }
}
