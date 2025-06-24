import { Sprint } from './sprint.entity';
import { TimelineService } from '../common/timeline.service';
import { WorkItem } from '../backlog/work-items/work-item.entity';
import { Initiative } from '../roadmap/initiatives/initiative.entity';

function formatDate(date: Date) {
  if (!date) return null;
  return date.toISOString().split('T')[0];
}

class WorkItemMapper {
  static async toDto(workItem: WorkItem) {
    const initiative = await workItem.initiative;
    const sprint = await workItem.sprint;
    const assignedTo = await workItem.assignedTo;
    return {
      id: workItem.id,
      reference: workItem.reference,
      title: workItem.title,
      description: workItem.description,
      priority: workItem.priority,
      type: workItem.type,
      status: workItem.status,
      estimation: workItem.estimation,
      sprint: sprint ? { id: sprint.id, title: sprint.title } : null,
      initiative: initiative ? InitiativeMapper.toDto(initiative) : null,
      assignedTo: assignedTo
        ? { id: assignedTo.id, name: assignedTo.name }
        : null,
      completedAt: workItem.completedAt,
      createdAt: workItem.createdAt,
      updatedAt: workItem.updatedAt,
    };
  }
}

class InitiativeMapper {
  static toDto(initiative: Initiative) {
    return {
      id: initiative.id,
      title: initiative.title,
    };
  }
}

export class SprintMapper {
  static async toDto(sprint: Sprint) {
    const workItems = await sprint.workItems;
    return {
      id: sprint.id,
      title: sprint.title,
      goal: sprint.goal,
      startDate: formatDate(sprint.startDate),
      endDate: formatDate(sprint.endDate),
      actualStartDate: formatDate(sprint.actualStartDate),
      actualEndDate: formatDate(sprint.actualEndDate),
      timeline: TimelineService.convertDateToTimeline(sprint.startDate),
      workItems: await Promise.all(workItems.map(WorkItemMapper.toDto)),
      velocity: sprint.velocity,
      duration: sprint.duration,
      createdAt: sprint.createdAt,
      updatedAt: sprint.updatedAt,
      status: sprint.status,
    };
  }

  static toListItemDto(sprint: Sprint) {
    return {
      id: sprint.id,
      title: sprint.title,
      goal: sprint.goal,
      startDate: formatDate(sprint.startDate),
      endDate: formatDate(sprint.endDate),
      actualStartDate: formatDate(sprint.actualStartDate),
      actualEndDate: formatDate(sprint.actualEndDate),
      duration: sprint.duration,
      createdAt: sprint.createdAt,
      updatedAt: sprint.updatedAt,
      status: sprint.status,
    };
  }
}
