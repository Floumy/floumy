import { Milestone } from '../../milestones/milestone.entity';
import { KeyResult } from '../../../okrs/key-result.entity';
import { WorkItem } from '../../../backlog/work-items/work-item.entity';
import { Feature } from '../feature.entity';

export class FeatureMapper {
  static async toDto(feature: Feature) {
    const workItems = (await feature.workItems) || [];
    return {
      id: feature.id,
      reference: `F-${feature.sequenceNumber}`,
      title: feature.title,
      description: feature.description,
      priority: feature.priority,
      status: feature.status,
      progress: feature.progress,
      workItemsCount: feature.workItemsCount,
      workItems: workItems.map((workItem) =>
        this.mapWorkItemToWorkItemDto(workItem),
      ),
      createdAt: feature.createdAt,
      updatedAt: feature.updatedAt,
      keyResult: this.mapKeyResultToKeyResultDto(await feature.keyResult),
      milestone: this.mapMilestoneToMilestoneDto(await feature.milestone),
    };
  }

  static mapWorkItemToWorkItemDto(workItem: WorkItem) {
    return {
      id: workItem.id,
      reference: `WI-${workItem.sequenceNumber}`,
      title: workItem.title,
      description: workItem.description,
      priority: workItem.priority,
      status: workItem.status,
      type: workItem.type,
      estimation: workItem.estimation,
      createdAt: workItem.createdAt,
      updatedAt: workItem.updatedAt,
    };
  }

  static mapKeyResultToKeyResultDto(keyResult: KeyResult) {
    if (!keyResult) {
      return null;
    }
    return {
      id: keyResult.id,
      title: keyResult.title,
    };
  }

  static mapMilestoneToMilestoneDto(milestone: Milestone) {
    if (!milestone) {
      return null;
    }
    return {
      id: milestone.id,
      title: milestone.title,
      dueDate: milestone.dueDate,
    };
  }
}
