export class PublicWorkItemMapper {
  static async toDto(workItem) {
    const feature = await workItem.feature;
    const iteration = await workItem.iteration;

    return {
      id: workItem.id,
      reference: `WI-${workItem.sequenceNumber}`,
      title: workItem.title,
      description: workItem.description,
      priority: workItem.priority,
      type: workItem.type,
      status: workItem.status,
      estimation: workItem.estimation,
      feature: feature ? { id: feature.id, title: feature.title } : null,
      iteration: iteration
        ? { id: iteration.id, title: iteration.title }
        : null,
      completedAt: workItem.completedAt,
      createdAt: workItem.createdAt,
      updatedAt: workItem.updatedAt,
    };
  }
}
