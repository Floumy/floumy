import { Request } from './request.entity';
import { RequestDto } from './dtos';
import { CommentMapper } from '../comments/mappers';
import { InitiativeMapper } from '../roadmap/initiatives/initiative.mapper';

export class RequestsMapper {
  static async toRequestDto(request: Request): Promise<RequestDto> {
    const org = await request.org;
    const createdBy = await request.createdBy;
    const comments = await request.comments;
    const initiatives = await request.initiatives;

    return {
      id: request.id,
      title: request.title,
      description: request.description,
      createdBy: {
        id: createdBy.id,
        email: createdBy.email,
      },
      org: {
        id: org.id,
        name: org.name,
      },
      votesCount: request.votesCount,
      status: request.status,
      estimation: request.estimation,
      completedAt: request.completedAt,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
      comments: await CommentMapper.toDtoList(comments),
      initiatives: await Promise.all(initiatives.map(InitiativeMapper.toDto)),
    };
  }

  static async toListDto(requests: Request[]) {
    return await Promise.all(requests.map(this.toListItemDto));
  }

  static async toListItemDto(request: Request) {
    return {
      id: request.id,
      title: request.title,
      description: request.description,
      votesCount: request.votesCount,
      status: request.status,
      estimation: request.estimation,
      completedAt: request.completedAt,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
    };
  }
}
