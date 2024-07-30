import { Entity, ManyToOne } from 'typeorm';
import { WorkItem } from './work-item.entity';
import { Comment } from '../../comments/comment-entity';

@Entity()
export class WorkItemComment extends Comment {
  @ManyToOne(() => WorkItem, (workItem) => workItem.comments, { lazy: false })
  workItem: Promise<WorkItem>;
}
