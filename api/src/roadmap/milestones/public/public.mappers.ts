import { Milestone } from '../milestone.entity';
import { MilestoneDto } from '../dtos';
import { TimelineService } from '../../../common/timeline.service';
import { Initiative } from '../../initiatives/initiative.entity';
import { InitiativeDto } from '../../../okrs/dtos';

export class PublicMilestoneMapper {
  static async toDto(milestone: Milestone): Promise<MilestoneDto> {
    return {
      id: milestone.id,
      title: milestone.title,
      description: milestone.description,
      dueDate: PublicMilestoneMapper.formatDate(milestone.dueDate),
      timeline: TimelineService.convertDateToTimeline(
        milestone.dueDate,
      ).valueOf(),
      initiatives: await Promise.all(
        (await milestone.initiatives).map(InitiativeMapper.toDto),
      ),
      createdAt: milestone.createdAt,
      updatedAt: milestone.updatedAt,
    };
  }

  private static formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}

class InitiativeMapper {
  static async toDto(initiative: Initiative): Promise<InitiativeDto> {
    return {
      id: initiative.id,
      reference: initiative.reference,
      title: initiative.title,
      priority: initiative.priority.valueOf(),
      status: initiative.status.valueOf(),
      progress: initiative.progress,
      workItemsCount: initiative.workItemsCount,
      createdAt: initiative.createdAt,
      updatedAt: initiative.updatedAt,
    };
  }
}
