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
import { Initiative } from '../roadmap/initiatives/initiative.entity';
import { Milestone } from '../roadmap/milestones/milestone.entity';
import { WorkItem } from '../backlog/work-items/work-item.entity';
import { Sprint } from '../sprints/sprint.entity';
import { File } from '../files/file.entity';
import { BipSettings } from '../bip/bip-settings.entity';
import { FeedItem } from '../feed/feed-item.entity';
import { FeatureRequest } from '../feature-requests/feature-request.entity';
import { Issue } from '../issues/issue.entity';
import { Org } from '../orgs/org.entity';
import { Notification } from '../notifications/notification.entity';
import { GithubPullRequest } from '../github/github-pull-request.entity';
import { GithubBranch } from '../github/github-branch.entity';
import { GitlabBranch } from '../gitlab/gitlab-branch.entity';
import { GitlabMergeRequest } from '../gitlab/gitlab-merge-request.entity';
import { Page } from '../pages/pages.entity';
import { ChatHistory } from '../ai/chat/chat-history.entity';

@Entity()
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  name: string;
  @Column({ type: 'text' })
  description: string;
  @Column({ nullable: true })
  githubAccessToken: string;
  @Column({ nullable: true })
  githubUsername: string;
  @Column({ nullable: true })
  gitlabAccessToken: string;
  @Column({ nullable: true })
  githubRepositoryId: string;
  @Column({ nullable: true })
  githubRepositoryFullName: string;
  @Column({ nullable: true })
  githubRepositoryUrl: string;
  @Column({ nullable: true })
  githubRepositoryWebhookId: string;
  @Column({ nullable: true })
  gitlabProjectId: string;
  @Column({ nullable: true })
  gitlabProjectUrl: string;
  @Column({ nullable: true })
  gitlabProjectName: string;
  @Column({ nullable: true })
  gitlabProjectWebhookId: number;
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
  @OneToMany(() => Initiative, (feature) => feature.project, { lazy: true })
  initiatives: Promise<Initiative[]>;
  @OneToMany(() => Milestone, (milestone) => milestone.project, { lazy: true })
  milestones: Promise<Milestone[]>;
  @OneToMany(() => WorkItem, (workItem) => workItem.project, { lazy: true })
  workItems: Promise<WorkItem[]>;
  @OneToMany(() => FeatureRequest, (featureRequest) => featureRequest.project, {
    lazy: true,
  })
  featureRequests: Promise<FeatureRequest[]>;
  @OneToMany(() => Sprint, (sprint) => sprint.project, { lazy: true })
  sprints: Promise<Sprint[]>;
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
  @OneToMany(() => GitlabBranch, (gitlabBranch) => gitlabBranch.project, {
    lazy: true,
  })
  gitlabBranches: Promise<GitlabBranch[]>;
  @OneToMany(
    () => GithubPullRequest,
    (githubPullRequest) => githubPullRequest.project,
    { lazy: true },
  )
  gitlabMergeRequests: Promise<GitlabMergeRequest[]>;
  @OneToMany(() => Page, (wikiPage) => wikiPage.project, { lazy: true })
  pages: Promise<Page[]>;

  @OneToMany(() => ChatHistory, (chatHistoryItem) => chatHistoryItem.project, {
    lazy: true,
  })
  historyItems: Promise<ChatHistory[]>;
}
