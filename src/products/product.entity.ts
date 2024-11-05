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

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  name: string;
  @ManyToMany(() => User, (user) => user.products, { lazy: true })
  @JoinTable({
    name: 'product_user',
    joinColumn: {
      name: 'productId',
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
  @OneToMany(() => Objective, (objective) => objective.product, { lazy: true })
  objectives: Promise<Objective[]>;
  @OneToMany(() => KeyResult, (keyResult) => keyResult.product, { lazy: true })
  keyResults: Promise<KeyResult[]>;
  @OneToMany(() => Feature, (feature) => feature.product, { lazy: true })
  features: Promise<Feature[]>;
  @OneToMany(() => Milestone, (milestone) => milestone.product, { lazy: true })
  milestones: Promise<Milestone[]>;
  @OneToMany(() => WorkItem, (workItem) => workItem.product, { lazy: true })
  workItems: Promise<WorkItem[]>;
  @OneToMany(() => FeatureRequest, (featureRequest) => featureRequest.product, {
    lazy: true,
  })
  featureRequests: Promise<FeatureRequest[]>;
  @OneToMany(() => Iteration, (iteration) => iteration.product, { lazy: true })
  iterations: Promise<Iteration[]>;
  @OneToMany(() => File, (file) => file.product, { lazy: true })
  files: Promise<File[]>;
  @OneToMany(() => FeedItem, (feedItem) => feedItem.product, { lazy: true })
  feedItems: Promise<FeedItem[]>;
  @OneToOne(() => BipSettings, (bipSettings) => bipSettings.product, {
    lazy: true,
  })
  bipSettings: Promise<BipSettings>;
  @OneToMany(() => Issue, (issue) => issue.product, { lazy: true })
  issues: Promise<Issue[]>;
  @ManyToOne(() => Org, (org) => org.products, { lazy: true })
  org: Promise<Org>;
}
