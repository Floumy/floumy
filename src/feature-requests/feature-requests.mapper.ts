import { FeatureRequest } from './feature-request.entity';
import { FeatureRequestDto } from './dtos';

export class FeatureRequestsMapper {
  static async toFeatureRequestDto(
    featureRequest: FeatureRequest,
  ): Promise<FeatureRequestDto> {
    const org = await featureRequest.org;
    const createdBy = await featureRequest.createdBy;
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
      status: featureRequest.status,
      estimation: featureRequest.estimation,
      completedAt: featureRequest.completedAt,
    };
  }
}
