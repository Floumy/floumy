export class FeedItemMapper {
  static toDto(feedItem: any) {
    return {
      id: feedItem.id,
      title: feedItem.title,
      entity: feedItem.entity,
      entityId: feedItem.entityId,
      action: feedItem.action,
      content: feedItem.content,
      org: feedItem.org,
      createdAt: feedItem.createdAt,
    };
  }
}
