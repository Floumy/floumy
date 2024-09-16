import { Issue } from './issue.entity';
import { CommentMapper } from '../comments/mappers';

export class IssueMapper {
  static async toDto(issue: Issue) {
    const comments = await issue.comments;
    return {
      id: issue.id,
      title: issue.title,
      description: issue.description,
      comments: await CommentMapper.toDtoList(comments),
      createdAt: issue.createdAt,
      updatedAt: issue.updatedAt,
    };
  }
}
