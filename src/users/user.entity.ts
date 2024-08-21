import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RefreshToken } from '../auth/refresh-token.entity';
import { Org } from '../orgs/org.entity';
import { WorkItem } from '../backlog/work-items/work-item.entity';
import { Feature } from '../roadmap/features/feature.entity';
import { Objective } from '../okrs/objective.entity';
import { FeedItem } from '../feed/feed-item.entity';
import { FeatureRequest } from '../feature-requests/feature-request.entity';

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
  lastSignedIn: Date;
  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user, {
    cascade: true,
    lazy: true,
  })
  refreshTokens: Promise<RefreshToken[]>;
  @OneToMany(() => WorkItem, (workItem) => workItem.createdBy, { lazy: true })
  createdWorkItems: Promise<WorkItem[]>;
  @OneToMany(() => WorkItem, (workItem) => workItem.assignedTo, { lazy: true })
  assignedWorkItems: Promise<WorkItem[]>;
  @OneToMany(() => Feature, (feature) => feature.createdBy, { lazy: true })
  createdFeatures: Promise<Feature[]>;
  @OneToMany(() => Feature, (feature) => feature.assignedTo, { lazy: true })
  assignedFeatures: Promise<Feature[]>;
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
  @OneToMany(() => Objective, (objective) => objective.assignedTo, {
    lazy: true,
  })
  assignedObjectives: any;
  @ManyToOne(() => Org, (org) => org.users, { lazy: true, nullable: true })
  org: Promise<Org>;

  constructor(name: string, email: string, password: string) {
    this.name = name;
    this.email = email;
    this.password = password;
  }
}
