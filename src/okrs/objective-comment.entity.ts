import { Entity, ManyToOne } from 'typeorm';
import { Comment } from '../comments/comment-entity';
import { Objective } from './objective.entity';

@Entity()
export class ObjectiveComment extends Comment {
  @ManyToOne(() => Objective, (objective) => objective.comments, { lazy: true })
  objective: Promise<Objective>;
}
