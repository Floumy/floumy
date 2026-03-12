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
import { RequestStatus } from './request-status.enum';
import { RequestVote } from './request-vote.entity';
import { RequestComment } from './request-comment.entity';
import { Initiative } from '../roadmap/initiatives/initiative.entity';
import { Project } from '../projects/project.entity';

@Entity('request')
export class Request {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  title: string;
  @Column()
  description: string;
  @Column({
    type: 'enum',
    enum: RequestStatus,
    default: RequestStatus.PLANNED,
  })
  status: RequestStatus;
  @Column({
    nullable: true,
  })
  estimation: number;

  @Column({ default: 1 })
  votesCount: number;

  @OneToMany(() => RequestVote, (requestVote) => requestVote.request, {
    lazy: true,
    onDelete: 'CASCADE',
  })
  votes: Promise<RequestVote[]>;

  @Column({
    nullable: true,
  })
  completedAt: Date;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @ManyToOne(() => User, (user) => user.createdRequests, { lazy: false })
  createdBy: Promise<User>;
  @ManyToOne(() => Org, (org) => org.requests, { lazy: false })
  org: Promise<Org>;
  @OneToMany(() => RequestComment, (comment) => comment.request, {
    lazy: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  comments: Promise<RequestComment[]>;
  @OneToMany(() => Initiative, (initiative) => initiative.request, {
    lazy: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  initiatives: Promise<Initiative[]>;
  @ManyToOne(() => Project, (project) => project.requests, {
    lazy: true,
  })
  project: Promise<Project>;
}
