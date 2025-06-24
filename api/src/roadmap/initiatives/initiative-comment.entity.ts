import { Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm';
import { Comment } from '../../comments/comment-entity';
import { Initiative } from './initiative.entity';
import { User } from '../../users/user.entity';

@Entity()
export class InitiativeComment extends Comment {
  @ManyToOne(() => Initiative, (initiative) => initiative.comments, {
    lazy: true,
  })
  initiative: Promise<Initiative>;

  @ManyToMany(() => User, {
    lazy: true,
  })
  @JoinTable({
    name: 'initiative_comment_mentions',
    joinColumn: {
      name: 'initiativeCommentId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'userId',
      referencedColumnName: 'id',
    },
  })
  mentions: Promise<User[]>;
}
