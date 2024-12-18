import { Issue } from './issue.entity';
import { CommentMapper } from '../comments/mappers';

export class IssueMapper {
  static async toDto(issue: Issue) {
    const comments = await issue.comments;
    const workItems = await issue.workItems;
    return {
      id: issue.id,
      title: issue.title,
      description: issue.description,
      status: issue.status,
      priority: issue.priority,
      comments: await CommentMapper.toDtoList(comments),
      workItems: workItems
        .sort((a, b) => {
          const priorityMap = ['low', 'medium', 'high'];
          return (
            priorityMap.indexOf(b.priority) - priorityMap.indexOf(a.priority)
          );
        })
        .map((workItem) => ({
          reference: workItem.reference,
          id: workItem.id,
          title: workItem.title,
          description: workItem.description,
          priority: workItem.priority,
          status: workItem.status,
          type: workItem.type,
          estimation: workItem.estimation,
          completedAt: workItem.completedAt,
          createdAt: workItem.createdAt,
          updatedAt: workItem.updatedAt,
        })),
      createdAt: issue.createdAt,
      updatedAt: issue.updatedAt,
    };
  }
}

export class IssueListItemMapper {
  static async toListItemDto(issue: Issue) {
    return {
      id: issue.id,
      title: issue.title,
      description: issue.description,
      status: issue.status,
      priority: issue.priority,
      createdAt: issue.createdAt,
      updatedAt: issue.updatedAt,
    };
  }
}
