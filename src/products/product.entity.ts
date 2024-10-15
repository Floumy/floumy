import {
  Column,
  CreateDateColumn,
  Entity,
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

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  name: string;
  @OneToMany(() => User, (user) => user.org, { lazy: true })
  users: Promise<User[]>;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @OneToMany(() => Objective, (objective) => objective.org, { lazy: true })
  objectives: Promise<Objective[]>;
  @OneToMany(() => KeyResult, (keyResult) => keyResult.org, { lazy: true })
  keyResults: Promise<KeyResult[]>;
  @OneToMany(() => Feature, (feature) => feature.org, { lazy: true })
  features: Promise<Feature[]>;
  @OneToMany(() => Milestone, (milestone) => milestone.org, { lazy: true })
  milestones: Promise<Milestone[]>;
  @OneToMany(() => WorkItem, (workItem) => workItem.org, { lazy: true })
  workItems: Promise<WorkItem[]>;
  @OneToMany(() => FeatureRequest, (featureRequest) => featureRequest.org, {
    lazy: true,
  })
  featureRequests: Promise<FeatureRequest[]>;
  @OneToMany(() => Iteration, (iteration) => iteration.org, { lazy: true })
  iterations: Promise<Iteration[]>;
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
  @ManyToOne(() => Org, (org) => org.products, { lazy: true })
  org: Promise<Org>;
}
