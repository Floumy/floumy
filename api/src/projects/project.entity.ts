import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Objective } from '../okrs/objective.entity';
import { KeyResult } from '../okrs/key-result.entity';
import { Feature } from '../roadmap/features/feature.entity';
import { Milestone } from '../roadmap/milestones/milestone.entity';
import { WorkItem } from '../backlog/work-items/work-item.entity';
import { Iteration } from '../iterations/Iteration.entity';
import { File } from '../files/file.entity';
import { BipSettings } from '../bip/bip-settings.entity';
import { FeedItem } from '../feed/feed-item.entity';
import { FeatureRequest } from '../feature-requests/feature-request.entity';
import { Issue } from '../issues/issue.entity';
import { Org } from '../orgs/org.entity';
import { Notification } from '../notifications/notification.entity';
import { GithubPullRequest } from '../github/github-pull-request.entity';
import { GithubBranch } from '../github/github-branch.entity';

@Entity()
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  name: string;
  @Column({ nullable: true })
  githubRepositoryId: string;
  @Column({ nullable: true })
  githubRepositoryFullName: string;
  @Column({ nullable: true })
  githubRepositoryUrl: string;
  @Column({ nullable: true })
  githubRepositoryWebhookId: string;
  @ManyToMany(() => User, (user) => user.projects, { lazy: true })
  @JoinTable({
    name: 'project_user',
    joinColumn: {
      name: 'projectId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'userId',
      referencedColumnName: 'id',
    },
  })
  users: Promise<User[]>;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @OneToMany(() => Objective, (objective) => objective.project, { lazy: true })
  objectives: Promise<Objective[]>;
  @OneToMany(() => KeyResult, (keyResult) => keyResult.project, { lazy: true })
  keyResults: Promise<KeyResult[]>;
  @OneToMany(() => Feature, (feature) => feature.project, { lazy: true })
  features: Promise<Feature[]>;
  @OneToMany(() => Milestone, (milestone) => milestone.project, { lazy: true })
  milestones: Promise<Milestone[]>;
  @OneToMany(() => WorkItem, (workItem) => workItem.project, { lazy: true })
  workItems: Promise<WorkItem[]>;
  @OneToMany(() => FeatureRequest, (featureRequest) => featureRequest.project, {
    lazy: true,
  })
  featureRequests: Promise<FeatureRequest[]>;
  @OneToMany(() => Iteration, (iteration) => iteration.project, { lazy: true })
  iterations: Promise<Iteration[]>;
  @OneToMany(() => File, (file) => file.project, { lazy: true })
  files: Promise<File[]>;
  @OneToMany(() => FeedItem, (feedItem) => feedItem.project, { lazy: true })
  feedItems: Promise<FeedItem[]>;
  @OneToOne(() => BipSettings, (bipSettings) => bipSettings.project, {
    lazy: true,
  })
  bipSettings: Promise<BipSettings>;
  @OneToMany(() => Issue, (issue) => issue.project, { lazy: true })
  issues: Promise<Issue[]>;
  @ManyToOne(() => Org, (org) => org.projects, { lazy: true })
  org: Promise<Org>;
  @OneToMany(() => Notification, (notification) => notification.project, {
    lazy: true,
  })
  notifications: Promise<Notification[]>;
  @OneToMany(
    () => GithubPullRequest,
    (githubPullRequest) => githubPullRequest.project,
    { lazy: true },
  )
  githubPullRequests: Promise<GithubPullRequest[]>;
  @OneToMany(() => GithubBranch, (githubBranch) => githubBranch.project, {
    lazy: true,
  })
  githubBranches: Promise<GithubBranch[]>;
}
