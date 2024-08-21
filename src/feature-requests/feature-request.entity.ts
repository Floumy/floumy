import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Org } from '../orgs/org.entity';
import { FeatureRequestStatus } from './feature-request-status.enum';

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
}
