import { CommentMapper } from '../../../comments/mappers';

export class PublicWorkItemMapper {
  static async toDto(workItem) {
    const feature = await workItem.feature;
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
      feature: feature ? { id: feature.id, title: feature.title } : null,
      sprint: sprint
        ? { id: sprint.id, title: sprint.title }
        : null,
      issue: issue ? { id: issue.id, title: issue.title } : null,
      comments: await CommentMapper.toDtoList(comments),
      completedAt: workItem.completedAt,
      createdAt: workItem.createdAt,
      updatedAt: workItem.updatedAt,
    };
  }
}
