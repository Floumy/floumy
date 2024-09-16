import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Org } from '../orgs/org.entity';
import { User } from '../users/user.entity';
import { IssueComment } from './issue-comment.entity';

@Entity()
export class Issue {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  title: string;
  @Column()
  description: string;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @ManyToOne(() => User, (user) => user.createdIssues, { lazy: false })
  createdBy: Promise<User>;
  @ManyToOne(() => Org, (org) => org.issues, { lazy: false })
  org: Promise<Org>;
  @OneToMany(() => IssueComment, (issueComment) => issueComment.issue, {
    lazy: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  comments: Promise<IssueComment[]>;
}
