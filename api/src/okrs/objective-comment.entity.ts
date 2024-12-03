import {Entity, JoinTable, ManyToMany, ManyToOne} from 'typeorm';
import { Comment } from '../comments/comment-entity';
import { Objective } from './objective.entity';
import {User} from "../users/user.entity";

@Entity()
export class ObjectiveComment extends Comment {
  @ManyToOne(() => Objective, (objective) => objective.comments, { lazy: true })
  objective: Promise<Objective>;

  @ManyToMany(() => User, {
    lazy: true,
  })
  @JoinTable({
    name: 'objective_comment_mentions',
    joinColumn: {
      name: 'objectiveCommentId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'userId',
      referencedColumnName: 'id',
    },
  })
  mentions: Promise<User[]>;
}
