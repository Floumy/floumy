import { FeatureRequest } from './feature-request.entity';
import { FeatureRequestDto } from './dtos';
import { CommentMapper } from '../comments/mappers';
import { FeatureMapper } from '../roadmap/features/feature.mapper';

export class FeatureRequestsMapper {
  static async toFeatureRequestDto(
    featureRequest: FeatureRequest,
  ): Promise<FeatureRequestDto> {
    const org = await featureRequest.org;
    const createdBy = await featureRequest.createdBy;
    const comments = await featureRequest.comments;
    const features = await featureRequest.features;

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
      features: await Promise.all(features.map(FeatureMapper.toDto)),
    };
  }

  static async toListDto(featureRequests: FeatureRequest[]) {
    return await Promise.all(featureRequests.map(this.toListItemDto));
  }

  static async toListItemDto(featureRequest: FeatureRequest) {
    return {
      id: featureRequest.id,
      title: featureRequest.title,
      description: featureRequest.description,
      votesCount: featureRequest.votesCount,
      status: featureRequest.status,
      estimation: featureRequest.estimation,
      completedAt: featureRequest.completedAt,
      createdAt: featureRequest.createdAt,
      updatedAt: featureRequest.updatedAt,
    };
  }
}
