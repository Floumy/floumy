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
import { IssueStatus } from './issue-status.enum';
import { Priority } from '../common/priority.enum';
import { WorkItem } from '../backlog/work-items/work-item.entity';
import { Product } from '../products/product.entity';

@Entity()
export class Issue {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  title: string;
  @Column()
  description: string;
  @Column({
    type: 'enum',
    enum: IssueStatus,
    default: IssueStatus.SUBMITTED,
  })
  status: IssueStatus;
  @Column({ type: 'enum', enum: Priority, default: Priority.MEDIUM })
  priority: Priority;
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
  @OneToMany(() => WorkItem, (workItem) => workItem.issue, { lazy: true })
  workItems: Promise<WorkItem[]>;
  @ManyToOne(() => Product, (product) => product.issues, { lazy: false })
  product: Promise<Product>;
}
