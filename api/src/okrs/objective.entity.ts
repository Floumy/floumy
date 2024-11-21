import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Org } from '../orgs/org.entity';
import { KeyResult } from './key-result.entity';
import { OKRStatus } from './okrstatus.enum';
import { User } from '../users/user.entity';
import { ObjectiveComment } from './objective-comment.entity';
import { Project } from '../projects/project.entity';

@Entity()
export class Objective {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  title: string;
  @Column({ default: 0, type: 'float' })
  progress: number;
  @Column({
    type: 'enum',
    enum: OKRStatus,
    default: OKRStatus.ON_TRACK,
  })
  status: OKRStatus;
  @Column({ nullable: true })
  startDate: Date;
  @Column({ nullable: true })
  endDate: Date;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @Column({
    type: 'int',
    nullable: false,
    unique: true,
  })
  sequenceNumber: number;
  @ManyToOne(() => Org, (org) => org.objectives, { lazy: true })
  org: Promise<Org>;
  @OneToMany(() => KeyResult, (keyResult) => keyResult.objective, {
    lazy: true,
  })
  keyResults: Promise<KeyResult[]>;
  @ManyToOne(() => User, (user) => user.assignedObjectives, { lazy: true })
  assignedTo: Promise<User>;
  @OneToMany(
    () => ObjectiveComment,
    (objectiveComment) => objectiveComment.objective,
    {
      lazy: true,
    },
  )
  comments: Promise<ObjectiveComment[]>;
  @ManyToOne(() => Project, (project) => project.objectives, { lazy: true })
  project: Promise<Project>;
}
