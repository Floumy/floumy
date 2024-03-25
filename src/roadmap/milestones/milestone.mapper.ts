import { Milestone } from './milestone.entity';
import {
  MilestoneDto,
  MilestoneListItemDto,
  MilestoneListWithFeaturesItemDto,
} from './dtos';
import { TimelineService } from '../../common/timeline.service';
import { Feature } from '../features/feature.entity';

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
      features: await Promise.all(
        (await milestone.features).map(FeatureMapper.toDto),
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

  static async toListWithFeaturesDto(
    milestones: Milestone[],
  ): Promise<MilestoneListWithFeaturesItemDto[]> {
    return await Promise.all(
      milestones.map(async (milestone) => ({
        id: milestone.id,
        title: milestone.title,
        description: milestone.description,
        dueDate: MilestoneMapper.formatDate(milestone.dueDate),
        timeline: TimelineService.convertDateToTimeline(
          milestone.dueDate,
        ).valueOf(),
        features: await Promise.all(
          (await milestone.features).map(FeatureMapper.toDto),
        ),
      })),
    );
  }

  private static formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}

class FeatureMapper {
  static async toDto(feature: Feature): Promise<FeatureDto> {
    const assignedTo = await feature.assignedTo;
    return {
      id: feature.id,
      reference: `F-${feature.sequenceNumber}`,
      title: feature.title,
      priority: feature.priority.valueOf(),
      status: feature.status.valueOf(),
      progress: feature.progress,
      workItemsCount: feature.workItemsCount,
      assignedTo: assignedTo
        ? {
            id: assignedTo.id,
            name: assignedTo.name,
          }
        : null,
      createdAt: feature.createdAt,
      updatedAt: feature.updatedAt,
    };
  }
}
