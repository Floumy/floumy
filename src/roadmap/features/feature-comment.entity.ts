import { Entity, ManyToOne } from 'typeorm';
import { Comment } from '../../comments/comment-entity';
import { Feature } from './feature.entity';

@Entity()
export class FeatureComment extends Comment {
  @ManyToOne(() => Feature, (feature) => feature.comments, { lazy: true })
  feature: Promise<Feature>;
}
