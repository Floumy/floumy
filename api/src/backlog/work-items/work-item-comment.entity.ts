import {Entity, JoinTable, ManyToMany, ManyToOne} from 'typeorm';
import {WorkItem} from './work-item.entity';
import {Comment} from '../../comments/comment-entity';
import {User} from '../../users/user.entity';

@Entity()
export class WorkItemComment extends Comment {
  @ManyToOne(() => WorkItem, (workItem) => workItem.comments, {
    lazy: true,
    onDelete: 'CASCADE',
  })
  workItem: Promise<WorkItem>;

  @ManyToMany(() => User, {
    lazy: true,
  })
  @JoinTable({
    name: 'work_item_comment_mentions',
    joinColumn: {
      name: 'workItemCommentId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'userId',
      referencedColumnName: 'id',
    },
  })
  mentions: Promise<User[]>;
}
