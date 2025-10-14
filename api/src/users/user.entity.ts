import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RefreshToken } from '../auth/refresh-token.entity';
import { Org } from '../orgs/org.entity';
import { WorkItem } from '../backlog/work-items/work-item.entity';
import { Initiative } from '../roadmap/initiatives/initiative.entity';
import { Objective } from '../okrs/objective.entity';
import { FeedItem } from '../feed/feed-item.entity';
import { FeatureRequest } from '../feature-requests/feature-request.entity';
import { FeatureRequestVote } from '../feature-requests/feature-request-vote.entity';
import { Issue } from '../issues/issue.entity';
import { Project } from '../projects/project.entity';
import { Notification } from '../notifications/notification.entity';
import { UserRole } from './enums';
import { uuid } from 'uuidv4';
import { ChatHistory } from '../ai/chat/chat-history.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  name: string;
  @Column()
  email: string;
  @Column()
  password: string;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @Column({ default: false })
  isActive: boolean;
  @Column({ nullable: true })
  activationToken: string;
  @Column({ nullable: true })
  passwordResetToken: string;
  @Column({ nullable: true })
  mcpToken: string;
  @Column({ nullable: true })
  lastSignedIn: Date;
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.ADMIN,
  })
  role: UserRole;
  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user, {
    cascade: true,
    lazy: true,
  })
  refreshTokens: Promise<RefreshToken[]>;
  @OneToMany(() => WorkItem, (workItem) => workItem.createdBy, { lazy: true })
  createdWorkItems: Promise<WorkItem[]>;
  @OneToMany(() => WorkItem, (workItem) => workItem.assignedTo, { lazy: true })
  assignedWorkItems: Promise<WorkItem[]>;
  @OneToMany(() => Initiative, (feature) => feature.createdBy, { lazy: true })
  createdInitiatives: Promise<Initiative[]>;
  @OneToMany(() => Initiative, (feature) => feature.assignedTo, { lazy: true })
  assignedInitiatives: Promise<Initiative[]>;
  @OneToMany(() => FeedItem, (feedItem) => feedItem.user, { lazy: true })
  feedItems: Promise<FeedItem[]>;
  @OneToMany(
    () => FeatureRequest,
    (featureRequest) => featureRequest.createdBy,
    {
      lazy: true,
    },
  )
  createdFeatureRequests: Promise<FeatureRequest[]>;

  @OneToMany(() => Issue, (issue) => issue.createdBy, { lazy: true })
  createdIssues: Promise<Issue[]>;

  @OneToMany(
    () => FeatureRequestVote,
    (featureRequestVote) => featureRequestVote.user,
    {
      lazy: true,
    },
  )
  featureRequestVotes: Promise<FeatureRequestVote[]>;

  @OneToMany(() => Objective, (objective) => objective.assignedTo, {
    lazy: true,
  })
  assignedObjectives: any;
  @ManyToOne(() => Org, (org) => org.users, { lazy: true, nullable: true })
  org: Promise<Org>;

  @ManyToMany(() => Project, (project) => project.users, { lazy: true })
  projects: Promise<Project[]>;

  @OneToMany(() => Notification, (notification) => notification.user, {
    lazy: true,
  })
  createdNotifications: Promise<Notification[]>;

  @OneToMany(() => Notification, (notification) => notification.user, {
    lazy: true,
  })
  notifications: Promise<Notification[]>;

  @OneToMany(() => ChatHistory, (chatHistoryItem) => chatHistoryItem.user, {
    lazy: true,
  })
  chatHistoryItems: Promise<ChatHistory[]>;

  constructor(name: string, email: string, password: string) {
    this.name = name;
    this.email = email;
    this.password = password;
    this.mcpToken = uuid();
  }
}
