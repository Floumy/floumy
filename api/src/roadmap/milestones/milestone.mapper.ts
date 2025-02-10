import { Milestone } from './milestone.entity';
import {
  MilestoneDto,
  MilestoneListItemDto,
  MilestoneListWithInitiativesItemDto,
} from './dtos';
import { TimelineService } from '../../common/timeline.service';
import { Initiative } from '../initiatives/initiative.entity';
import { InitiativeDto } from '../../okrs/dtos';

export class MilestoneMapper {
  static async toDto(milestone: Milestone): Promise<MilestoneDto> {
    return {
      id: milestone.id,
      title: milestone.title,
      description: milestone.description,
      dueDate: MilestoneMapper.formatDate(milestone.dueDate),
      timeline: TimelineService.convertDateToTimeline(
        milestone.dueDate,
      ).valueOf(),
      initiatives: await Promise.all(
        (await milestone.initiatives).map(InitiativesMapper.toDto),
      ),
      createdAt: milestone.createdAt,
      updatedAt: milestone.updatedAt,
    };
  }

  static toListDto(milestones: Milestone[]): MilestoneListItemDto[] {
    return milestones.map((milestone) => ({
      id: milestone.id,
      title: milestone.title,
      description: milestone.description,
      timeline: TimelineService.convertDateToTimeline(
        milestone.dueDate,
      ).valueOf(),
      dueDate: MilestoneMapper.formatDate(milestone.dueDate),
    }));
  }

  static async toListWithInitiativesDto(
    milestones: Milestone[],
  ): Promise<MilestoneListWithInitiativesItemDto[]> {
    return await Promise.all(
      milestones.map(async (milestone) => ({
        id: milestone.id,
        title: milestone.title,
        description: milestone.description,
        dueDate: MilestoneMapper.formatDate(milestone.dueDate),
        timeline: TimelineService.convertDateToTimeline(
          milestone.dueDate,
        ).valueOf(),
        initiatives: await Promise.all(
          (await milestone.initiatives).map(InitiativesMapper.toDto),
        ),
      })),
    );
  }

  private static formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}

class InitiativesMapper {
  static async toDto(initiative: Initiative): Promise<InitiativeDto> {
    const assignedTo = await initiative.assignedTo;
    return {
      id: initiative.id,
      reference: initiative.reference,
      title: initiative.title,
      priority: initiative.priority.valueOf(),
      status: initiative.status.valueOf(),
      progress: initiative.progress,
      workItemsCount: initiative.workItemsCount,
      assignedTo: assignedTo
        ? {
            id: assignedTo.id,
            name: assignedTo.name,
          }
        : null,
      createdAt: initiative.createdAt,
      updatedAt: initiative.updatedAt,
    };
  }
}
