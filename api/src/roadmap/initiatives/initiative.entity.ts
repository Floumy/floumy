import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Org } from '../../orgs/org.entity';
import { InitiativeStatus } from './initiativestatus.enum';
import { KeyResult } from '../../okrs/key-result.entity';
import { Priority } from '../../common/priority.enum';
import { Milestone } from '../milestones/milestone.entity';
import { WorkItem } from '../../backlog/work-items/work-item.entity';
import { InitiativeFile } from './initiative-file.entity';
import { User } from '../../users/user.entity';
import { InitiativeComment } from './initiative-comment.entity';
import { FeatureRequest } from '../../feature-requests/feature-request.entity';
import { Project } from '../../projects/project.entity';

@Entity()
@Unique(['reference', 'org'])
export class Initiative {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  title: string;
  @Column({ nullable: true })
  description: string;
  @Column({
    type: 'enum',
    enum: Priority,
    default: Priority.MEDIUM,
  })
  priority: Priority;
  @Column({
    type: 'enum',
    enum: InitiativeStatus,
    default: InitiativeStatus.PLANNED,
  })
  status: InitiativeStatus;
  @Column({ default: 0, type: 'float' })
  progress: number;
  @Column({ default: 0 })
  workItemsCount: number;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @Column({ nullable: true })
  completedAt: Date;
  @Column({
    nullable: false,
  })
  reference: string;
  @ManyToOne(() => Org, (org) => org.initiatives, { lazy: true })
  org: Promise<Org>;
  @ManyToOne(() => Project, (project) => project.initiatives, { lazy: true })
  project: Promise<Project>;
  @ManyToOne(() => User, (user) => user.createdInitiatives, { lazy: true })
  createdBy: Promise<User>;
  @ManyToOne(() => User, (user) => user.assignedInitiatives, { lazy: true })
  assignedTo: Promise<User>;
  @ManyToOne(() => KeyResult, (keyResult) => keyResult.initiatives, {
    lazy: true,
  })
  keyResult: Promise<KeyResult>;
  @ManyToOne(() => Milestone, (milestone) => milestone.initiatives, {
    lazy: true,
  })
  milestone: Promise<Milestone>;
  @OneToMany(() => WorkItem, (workItem) => workItem.initiative, { lazy: true })
  workItems: Promise<WorkItem[]>;
  @OneToMany(
    () => InitiativeFile,
    (initiativeFile) => initiativeFile.initiative,
  )
  initiativeFiles: Promise<InitiativeFile[]>;
  @OneToMany(
    () => InitiativeComment,
    (initiativeComment) => initiativeComment.initiative,
    {
      lazy: true,
    },
  )
  comments: Promise<InitiativeComment[]>;
  @ManyToOne(
    () => FeatureRequest,
    (featureRequest) => featureRequest.initiatives,
    {
      lazy: true,
    },
  )
  featureRequest: Promise<FeatureRequest>;

  @ManyToMany(() => User, {
    lazy: true,
  })
  @JoinTable({
    name: 'initiative_description_mentions',
    joinColumn: {
      name: 'initiativeId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'userId',
      referencedColumnName: 'id',
    },
  })
  mentions: Promise<User[]>;
}
