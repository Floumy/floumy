import { Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm';
import { Issue } from './issue.entity';
import { Comment } from '../comments/comment-entity';
import { User } from '../users/user.entity';

@Entity()
export class IssueComment extends Comment {
  @ManyToOne(() => Issue, (issue) => issue.comments, { lazy: true })
  issue: Promise<Issue>;

  @ManyToMany(() => User, {
    lazy: true,
  })
  @JoinTable({
    name: 'issue_comment_mentions',
    joinColumn: {
      name: 'issueCommentId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'userId',
      referencedColumnName: 'id',
    },
  })
  mentions: Promise<User[]>;
}
