import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Objective } from '../okrs/objective.entity';
import { KeyResult } from '../okrs/key-result.entity';
import { Initiative } from '../roadmap/initiatives/initiative.entity';
import { Milestone } from '../roadmap/milestones/milestone.entity';
import { WorkItem } from '../backlog/work-items/work-item.entity';
import { Sprint } from '../sprints/sprint.entity';
import { File } from '../files/file.entity';
import { BipSettings } from '../bip/bip-settings.entity';
import { PaymentPlan } from '../auth/payment.plan';
import { Invoice } from '../payments/invoice.entity';
import { FeedItem } from '../feed/feed-item.entity';
import { FeatureRequest } from '../feature-requests/feature-request.entity';
import { Issue } from '../issues/issue.entity';
import { Project } from '../projects/project.entity';
import { Notification } from '../notifications/notification.entity';
import { GithubBranch } from '../github/github-branch.entity';
import { GithubPullRequest } from '../github/github-pull-request.entity';
import { GitlabBranch } from '../gitlab/gitlab-branch.entity';
import { GitlabPullRequest } from '../gitlab/gitlab-pull-request.entity';

@Entity()
export class Org {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  name: string;
  @Column({ unique: true, default: () => 'uuid_generate_v4()' })
  invitationToken: string;
  @OneToMany(() => User, (user) => user.org, { lazy: true })
  users: Promise<User[]>;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @Column({
    type: 'enum',
    enum: PaymentPlan,
    default: PaymentPlan.FREE,
    nullable: false,
  })
  paymentPlan: PaymentPlan = PaymentPlan.FREE;
  @Column({ default: false })
  isSubscribed: boolean;
  @Column({ default: null, nullable: true })
  nextPaymentDate: Date;
  @Column({ default: null, nullable: true })
  stripeCustomerId: string;
  @Column({ default: null, nullable: true })
  stripeSubscriptionId: string;
  @Column({
    type: 'text',
    nullable: true,
  })
  githubAccessToken: string;
  @Column({ nullable: true })
  githubUsername: string;
  @Column({
    type: 'text',
    nullable: true,
  })
  gitlabToken: string;
  @OneToMany(() => Objective, (objective) => objective.org, { lazy: true })
  objectives: Promise<Objective[]>;
  @OneToMany(() => KeyResult, (keyResult) => keyResult.org, { lazy: true })
  keyResults: Promise<KeyResult[]>;
  @OneToMany(() => Initiative, (feature) => feature.org, { lazy: true })
  initiatives: Promise<Initiative[]>;
  @OneToMany(() => Milestone, (milestone) => milestone.org, { lazy: true })
  milestones: Promise<Milestone[]>;
  @OneToMany(() => WorkItem, (workItem) => workItem.org, { lazy: true })
  workItems: Promise<WorkItem[]>;
  @OneToMany(() => FeatureRequest, (featureRequest) => featureRequest.org, {
    lazy: true,
  })
  featureRequests: Promise<FeatureRequest[]>;
  @OneToMany(() => Sprint, (sprint) => sprint.org, { lazy: true })
  sprints: Promise<Sprint[]>;
  @OneToMany(() => Invoice, (invoice) => invoice.org, { lazy: true })
  invoices: Promise<Invoice[]>;
  @OneToMany(() => File, (file) => file.org, { lazy: true })
  files: Promise<File[]>;

  @OneToMany(() => FeedItem, (feedItem) => feedItem.org, { lazy: true })
  feedItems: Promise<FeedItem[]>;

  @OneToOne(() => BipSettings, (bipSettings) => bipSettings.org, {
    lazy: true,
  })
  bipSettings: Promise<BipSettings>;
  @OneToMany(() => Issue, (issue) => issue.org, { lazy: true })
  issues: Promise<Issue[]>;

  @OneToMany(() => Project, (project) => project.org, { lazy: true })
  projects: Promise<Project[]>;

  @OneToMany(() => Notification, (notification) => notification.org, {
    lazy: true,
  })
  notifications: Promise<Notification[]>;
  @OneToMany(() => GithubBranch, (githubBranch) => githubBranch.org, {
    lazy: true,
  })
  githubBranches: Promise<GithubBranch[]>;
  @OneToMany(
    () => GithubPullRequest,
    (githubPullRequest) => githubPullRequest.org,
    { lazy: true },
  )
  githubPullRequests: Promise<GithubPullRequest[]>;
  @OneToMany(() => GitlabBranch, (gitlabBranch) => gitlabBranch.org, {
    lazy: true,
  })
  gitlabBranches: Promise<GitlabBranch[]>;
  @OneToMany(
    () => GitlabPullRequest,
    (gitlabPullRequest) => gitlabPullRequest.org,
    { lazy: true },
  )
  gitlabPullRequests: Promise<GitlabPullRequest[]>;
}
