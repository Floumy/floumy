import { CommentDto } from './dtos';
import { Comment } from './comment-entity';

export class CommentMapper {
  static async toDto(comment: Comment): Promise<CommentDto> {
    const createdBy = await comment.createdBy;
    return {
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      createdBy: {
        id: createdBy.id,
        name: createdBy.name,
      },
    };
  }

  static async toDtoList(comments: Comment[]) {
    return await Promise.all(comments.map((comment) => this.toDto(comment)));
  }
}
