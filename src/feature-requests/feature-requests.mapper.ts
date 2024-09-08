import { FeatureRequest } from './feature-request.entity';
import { FeatureRequestDto } from './dtos';
import { CommentMapper } from '../comments/mappers';

export class FeatureRequestsMapper {
  static async toFeatureRequestDto(
    featureRequest: FeatureRequest,
  ): Promise<FeatureRequestDto> {
    const org = await featureRequest.org;
    const createdBy = await featureRequest.createdBy;
    const comments = await featureRequest.comments;

    return {
      id: featureRequest.id,
      title: featureRequest.title,
      description: featureRequest.description,
      createdBy: {
        id: createdBy.id,
        email: createdBy.email,
      },
      org: {
        id: org.id,
        name: org.name,
      },
      votesCount: featureRequest.votesCount,
      status: featureRequest.status,
      estimation: featureRequest.estimation,
      completedAt: featureRequest.completedAt,
      createdAt: featureRequest.createdAt,
      updatedAt: featureRequest.updatedAt,
      comments: await CommentMapper.toDtoList(comments),
    };
  }
}
