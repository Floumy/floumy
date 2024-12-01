import {Entity, JoinTable, ManyToMany, ManyToOne} from 'typeorm';
import { Comment } from '../../comments/comment-entity';
import { Feature } from './feature.entity';
import {User} from "../../users/user.entity";

@Entity()
export class FeatureComment extends Comment {
  @ManyToOne(() => Feature, (feature) => feature.comments, { lazy: true })
  feature: Promise<Feature>;

  @ManyToMany(() => User, {
    lazy: true,
  })
  @JoinTable({
    name: 'feature_comment_mentions',
    joinColumn: {
      name: 'featureCommentId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'userId',
      referencedColumnName: 'id',
    },
  })
  mentions: User[];
}
