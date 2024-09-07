import { Entity, ManyToOne } from 'typeorm';
import { FeatureRequest } from './feature-request.entity';
import { Comment } from '../comments/comment-entity';

@Entity()
export class FeatureRequestComment extends Comment {
  @ManyToOne(
    () => FeatureRequest,
    (featureRequest) => featureRequest.comments,
    { lazy: true },
  )
  featureRequest: Promise<FeatureRequest>;
}
