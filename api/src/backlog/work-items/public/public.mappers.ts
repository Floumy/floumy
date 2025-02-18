import { CommentMapper } from '../../../comments/mappers';
import { WorkItem } from '../work-item.entity';

class BreadcrumbMapper {
  static async toDto(
    workItem: WorkItem,
  ): Promise<{ reference: string; type: string; id: string }[]> {
    const initiative = await workItem.initiative;
    let keyResult = null;
    let objective = null;

    const breadcrumbs = [
      { reference: workItem.reference, type: 'work-item', id: workItem.id },
    ];

    if (initiative) {
      breadcrumbs.push({
        reference: initiative.reference,
        type: 'initiative',
        id: initiative.id,
      });
      keyResult = await initiative.keyResult;
    }

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

export class PublicWorkItemMapper {
  static async toDto(workItem: WorkItem) {
    const initiative = await workItem.initiative;
    const sprint = await workItem.sprint;
    const org = await workItem.org;
    const comments = await workItem.comments;
    const issue = await workItem.issue;

    return {
      id: workItem.id,
      reference: workItem.reference,
      title: workItem.title,
      description: workItem.description,
      priority: workItem.priority,
      type: workItem.type,
      status: workItem.status,
      estimation: workItem.estimation,
      org: { id: org.id, name: org.name, paymentPlan: org.paymentPlan },
      initiative: initiative
        ? { id: initiative.id, title: initiative.title }
        : null,
      sprint: sprint ? { id: sprint.id, title: sprint.title } : null,
      issue: issue ? { id: issue.id, title: issue.title } : null,
      breadcrumbs: await BreadcrumbMapper.toDto(workItem),
      comments: await CommentMapper.toDtoList(comments),
      completedAt: workItem.completedAt,
      createdAt: workItem.createdAt,
      updatedAt: workItem.updatedAt,
    };
  }
}
