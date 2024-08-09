import { PaymentPlan } from '../../../auth/payment.plan';
import { CommentMapper } from '../../../comments/mappers';

export class PublicWorkItemMapper {
  static async toDto(workItem) {
    const feature = await workItem.feature;
    const iteration = await workItem.iteration;
    const org = await workItem.org;
    let comments = [];
    if (org && org.paymentPlan === PaymentPlan.PREMIUM) {
      comments = await workItem.comments;
    }
    return {
      id: workItem.id,
      reference: `WI-${workItem.sequenceNumber}`,
      title: workItem.title,
      description: workItem.description,
      priority: workItem.priority,
      type: workItem.type,
      status: workItem.status,
      estimation: workItem.estimation,
      org: { id: org.id, name: org.name, paymentPlan: org.paymentPlan },
      feature: feature ? { id: feature.id, title: feature.title } : null,
      iteration: iteration
        ? { id: iteration.id, title: iteration.title }
        : null,
      comments: await CommentMapper.toDtoList(comments),
      completedAt: workItem.completedAt,
      createdAt: workItem.createdAt,
      updatedAt: workItem.updatedAt,
    };
  }
}
