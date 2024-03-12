import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Priority } from '../../common/priority.enum';
import { WorkItemStatus } from './work-item-status.enum';
import { Org } from '../../orgs/org.entity';
import { Feature } from '../../roadmap/features/feature.entity';
import { WorkItemType } from './work-item-type.enum';
import { Iteration } from '../../iterations/Iteration.entity';
import { WorkItemFile } from './work-item-file.entity';
import { User } from '../../users/user.entity';
import { WorkItemsStatusStats } from './work-items-status-stats.entity';

@Entity()
export class WorkItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  title: string;
  @Column()
  description: string;
  @Column({
    type: 'enum',
    enum: WorkItemType,
    default: WorkItemType.USER_STORY,
  })
  type: WorkItemType;
  @Column({
    type: 'enum',
    enum: Priority,
    default: Priority.MEDIUM,
  })
  priority: Priority;
  @Column({
    type: 'enum',
    enum: WorkItemStatus,
    default: WorkItemStatus.PLANNED,
  })
  status: WorkItemStatus;
  @Column({
    nullable: true,
  })
  estimation: number;
  @Column({
    nullable: true,
  })
  completedAt: Date;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @ManyToOne(() => User, (user) => user.createdWorkItems, { lazy: false })
  createdBy: Promise<User>;
  @ManyToOne(() => User, (user) => user.assignedWorkItems, { lazy: false })
  assignedTo: Promise<User>;
  @ManyToOne(() => Org, (org) => org.workItems, { lazy: false })
  org: Promise<Org>;
  @ManyToOne(() => Feature, (feature) => feature.workItems, { lazy: false })
  feature: Promise<Feature>;
  @ManyToOne(() => Iteration, (iteration) => iteration.workItems, {
    lazy: true,
  })
  iteration: Promise<Iteration>;
  @OneToMany(() => WorkItemFile, (workItemFile) => workItemFile.workItem)
  workItemFiles: Promise<WorkItemFile[]>;
  @OneToOne(
    () => WorkItemsStatusStats,
    (workItemsStatusStats) => workItemsStatusStats.workItem,
    { lazy: true },
  )
  @JoinColumn()
  workItemsStatusStats: Promise<WorkItemsStatusStats>;
}
