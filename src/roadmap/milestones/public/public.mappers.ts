import { Milestone } from '../milestone.entity';
import { MilestoneDto } from '../dtos';
import { TimelineService } from '../../../common/timeline.service';
import { Feature } from '../../features/feature.entity';
import { FeatureDto } from '../../../okrs/dtos';

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
      features: await Promise.all(
        (await milestone.features).map(FeatureMapper.toDto),
      ),
      createdAt: milestone.createdAt,
      updatedAt: milestone.updatedAt,
    };
  }

  private static formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}

class FeatureMapper {
  static async toDto(feature: Feature): Promise<FeatureDto> {
    return {
      id: feature.id,
      reference: `F-${feature.sequenceNumber}`,
      title: feature.title,
      priority: feature.priority.valueOf(),
      status: feature.status.valueOf(),
      progress: feature.progress,
      workItemsCount: feature.workItemsCount,
      createdAt: feature.createdAt,
      updatedAt: feature.updatedAt,
    };
  }
}
