import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Org } from '../orgs/org.entity';
import { FeatureRequestStatus } from './feature-request-status.enum';
import { FeatureRequestVote } from './feature-request-vote.entity';
import { FeatureRequestComment } from './feature-request-comment.entity';
import { Feature } from '../roadmap/features/feature.entity';

@Entity()
export class FeatureRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  title: string;
  @Column()
  description: string;
  @Column({
    type: 'enum',
    enum: FeatureRequestStatus,
    default: FeatureRequestStatus.PLANNED,
  })
  status: FeatureRequestStatus;
  @Column({
    nullable: true,
  })
  estimation: number;

  @Column({ default: 1 })
  votesCount: number;

  @OneToMany(
    () => FeatureRequestVote,
    (featureRequestVote) => featureRequestVote.featureRequest,
    {
      lazy: true,
      onDelete: 'CASCADE',
    },
  )
  votes: Promise<FeatureRequestVote[]>;

  @Column({
    nullable: true,
  })
  completedAt: Date;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @ManyToOne(() => User, (user) => user.createdFeatureRequests, { lazy: false })
  createdBy: Promise<User>;
  @ManyToOne(() => Org, (org) => org.featureRequests, { lazy: false })
  org: Promise<Org>;
  @OneToMany(() => FeatureRequestComment, (comment) => comment.featureRequest, {
    lazy: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  comments: Promise<FeatureRequestComment[]>;
  @OneToMany(() => Feature, (feature) => feature.featureRequest, {
    lazy: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  features: Promise<Feature[]>;
}
