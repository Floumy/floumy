import { Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm';
import { KeyResult } from './key-result.entity';
import { Comment } from '../comments/comment-entity';
import { User } from '../users/user.entity';

@Entity()
export class KeyResultComment extends Comment {
  @ManyToOne(() => KeyResult, (keyResult) => keyResult.comments, { lazy: true })
  keyResult: Promise<KeyResult>;

  @ManyToMany(() => User, {
    lazy: true,
  })
  @JoinTable({
    name: 'key_result_comment_mentions',
    joinColumn: {
      name: 'keyResultCommentId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'userId',
      referencedColumnName: 'id',
    },
  })
  mentions: User[];
}
