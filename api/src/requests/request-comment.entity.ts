import { Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm';
import { Request } from './request.entity';
import { Comment } from '../comments/comment-entity';
import { User } from '../users/user.entity';

@Entity('request_comment')
export class RequestComment extends Comment {
  @ManyToOne(() => Request, (request) => request.comments, { lazy: true })
  request: Promise<Request>;

  @ManyToMany(() => User, {
    lazy: true,
  })
  @JoinTable({
    name: 'request_comment_mentions',
    joinColumn: {
      name: 'requestCommentId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'userId',
      referencedColumnName: 'id',
    },
  })
  mentions: Promise<User[]>;
}
