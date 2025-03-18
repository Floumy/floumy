import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Priority } from '../../common/priority.enum';
import { WorkItemStatus } from './work-item-status.enum';
import { Org } from '../../orgs/org.entity';
import { Initiative } from '../../roadmap/initiatives/initiative.entity';
import { WorkItemType } from './work-item-type.enum';
import { Sprint } from '../../sprints/sprint.entity';
import { WorkItemFile } from './work-item-file.entity';
import { User } from '../../users/user.entity';
import { WorkItemsStatusStats } from './work-items-status-stats.entity';
import { WorkItemComment } from './work-item-comment.entity';
import { Issue } from '../../issues/issue.entity';
import { Project } from '../../projects/project.entity';
import { GithubBranch } from '../../github/github-branch.entity';
import { GithubPullRequest } from '../../github/github-pull-request.entity';
import { GitlabBranch } from '../../gitlab/gitlab-branch.entity';
import { GitlabPullRequest } from '../../gitlab/gitlab-pull-request.entity';

@Entity()
@Unique(['reference', 'org'])
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
  @Column({
    nullable: false,
  })
  reference: string;
  @ManyToOne(() => User, (user) => user.createdWorkItems, { lazy: false })
  createdBy: Promise<User>;
  @ManyToOne(() => User, (user) => user.assignedWorkItems, { lazy: false })
  assignedTo: Promise<User>;
  @ManyToOne(() => Org, (org) => org.workItems, { lazy: false })
  org: Promise<Org>;
  @ManyToOne(() => Initiative, (initiative) => initiative.workItems, {
    lazy: false,
  })
  initiative: Promise<Initiative>;
  @ManyToOne(() => Sprint, (sprint) => sprint.workItems, {
    lazy: true,
  })
  sprint: Promise<Sprint>;
  @OneToMany(
    () => WorkItemComment,
    (workItemComment) => workItemComment.workItem,
    { lazy: true, cascade: true, onDelete: 'CASCADE' },
  )
  comments: Promise<WorkItemComment[]>;
  @OneToMany(() => WorkItemFile, (workItemFile) => workItemFile.workItem)
  workItemFiles: Promise<WorkItemFile[]>;
  @OneToOne(
    () => WorkItemsStatusStats,
    (workItemsStatusStats) => workItemsStatusStats.workItem,
    { lazy: true },
  )
  @JoinColumn()
  workItemsStatusStats: Promise<WorkItemsStatusStats>;
  @ManyToOne(() => Issue, (issue) => issue.workItems, { lazy: true })
  issue: Promise<Issue>;
  @ManyToOne(() => Project, (project) => project.workItems, { lazy: true })
  project: Promise<Project>;
  @OneToMany(() => GithubBranch, (githubBranch) => githubBranch.workItem, {
    lazy: true,
  })
  githubBranches: Promise<GithubBranch[]>;

  @OneToMany(
    () => GithubPullRequest,
    (githubPullRequest) => githubPullRequest.workItem,
    {
      lazy: true,
    },
  )
  githubPullRequests: Promise<GithubPullRequest[]>;

  @OneToMany(() => GitlabBranch, (gitlabBranch) => gitlabBranch.workItem, {
    lazy: true,
  })
  gitlabBranches: Promise<GitlabBranch[]>;

  @OneToMany(
    () => GitlabPullRequest,
    (gitlabPullRequest) => gitlabPullRequest.workItem,
    {
      lazy: true,
    },
  )
  gitlabPullRequests: Promise<GitlabPullRequest[]>;
  @ManyToMany(() => User, {
    lazy: true,
  })
  @JoinTable({
    name: 'work_item_description_mentions',
    joinColumn: {
      name: 'workItemId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'userId',
      referencedColumnName: 'id',
    },
  })
  mentions: Promise<User[]>;
}
