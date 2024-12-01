import {Entity, JoinTable, ManyToMany, ManyToOne} from 'typeorm';
import { FeatureRequest } from './feature-request.entity';
import { Comment } from '../comments/comment-entity';
import {User} from "../users/user.entity";

@Entity()
export class FeatureRequestComment extends Comment {
  @ManyToOne(
    () => FeatureRequest,
    (featureRequest) => featureRequest.comments,
    { lazy: true },
  )
  featureRequest: Promise<FeatureRequest>;

  @ManyToMany(() => User, {
    lazy: true,
  })
  @JoinTable({
    name: 'feature_request_comment_mentions',
    joinColumn: {
      name: 'featureRequestCommentId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'userId',
      referencedColumnName: 'id',
    },
  })
  mentions: User[];
}
