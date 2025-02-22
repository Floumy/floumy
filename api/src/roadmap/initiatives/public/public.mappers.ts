import { Milestone } from '../../milestones/milestone.entity';
import { KeyResult } from '../../../okrs/key-result.entity';
import { WorkItem } from '../../../backlog/work-items/work-item.entity';
import { Initiative } from '../initiative.entity';
import { CommentMapper } from '../../../comments/mappers';
import { PaymentPlan } from '../../../auth/payment.plan';

class BreadcrumbMapper {
  static async toDto(
    initiative: Initiative,
  ): Promise<{ reference: string; type: string; id: string }[]> {
    const keyResult = await initiative.keyResult;
    let objective = null;

    const breadcrumbs = [
      {
        reference: initiative.reference,
        type: 'initiative',
        id: initiative.id,
      },
    ];

    if (keyResult) {
      breadcrumbs.push({
        reference: keyResult.reference,
        type: 'key-result',
        id: keyResult.id,
      });
      objective = await keyResult.objective;
    }

    if (objective) {
      breadcrumbs.push({
        reference: objective.reference,
        type: 'objective',
        id: objective.id,
      });
    }

    return breadcrumbs.reverse();
  }
}

export class FeatureMapper {
  static async toDto(initiative: Initiative) {
    const workItems = (await initiative.workItems) || [];
    const comments = await initiative.comments;
    const org = await initiative.org;
    const featureRequest = await initiative.featureRequest;
    const mappedFeature = {
      id: initiative.id,
      reference: initiative.reference,
      title: initiative.title,
      description: initiative.description,
      priority: initiative.priority,
      status: initiative.status,
      progress: initiative.progress,
      workItemsCount: initiative.workItemsCount,
      workItems: workItems.map((workItem) =>
        this.mapWorkItemToWorkItemDto(workItem),
      ),
      comments: await CommentMapper.toDtoList(comments),
      createdAt: initiative.createdAt,
      updatedAt: initiative.updatedAt,
      keyResult: this.mapKeyResultToKeyResultDto(await initiative.keyResult),
      milestone: this.mapMilestoneToMilestoneDto(await initiative.milestone),
      featureRequest: undefined,
      breadcrumbs: await BreadcrumbMapper.toDto(initiative),
    };
    if (org.paymentPlan === PaymentPlan.PREMIUM) {
      mappedFeature.featureRequest = featureRequest
        ? {
            id: featureRequest.id,
            title: featureRequest.title,
          }
        : null;
    }
    return mappedFeature;
  }

  static mapWorkItemToWorkItemDto(workItem: WorkItem) {
    return {
      id: workItem.id,
      reference: workItem.reference,
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
