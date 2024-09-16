import { Entity, ManyToOne } from 'typeorm';
import { Issue } from './issue.entity';
import { Comment } from '../comments/comment-entity';

@Entity()
export class IssueComment extends Comment {
  @ManyToOne(() => Issue, (issue) => issue.comments, { lazy: true })
  issue: Promise<Issue>;
}
