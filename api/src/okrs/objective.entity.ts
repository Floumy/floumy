import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Org } from '../orgs/org.entity';
import { KeyResult } from './key-result.entity';
import { ObjectiveStatus } from './okrstatus.enum';
import { User } from '../users/user.entity';
import { ObjectiveComment } from './objective-comment.entity';
import { Project } from '../projects/project.entity';

export enum ObjectiveLevel {
  ORGANIZATION = 'ORGANIZATION',
  PROJECT = 'PROJECT',
}

@Entity()
@Unique(['reference', 'org'])
export class Objective {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  title: string;
  @Column({ default: 0, type: 'float' })
  progress: number;
  @Column({
    type: 'enum',
    enum: ObjectiveStatus,
    default: ObjectiveStatus.ON_TRACK,
  })
  status: ObjectiveStatus;
  @Column({ nullable: true })
  startDate: Date;
  @Column({ nullable: true })
  endDate: Date;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @Column({
    nullable: false,
  })
  reference: string;
  @Column({
    type: 'enum',
    enum: ObjectiveLevel,
    default: ObjectiveLevel.PROJECT,
  })
  level: ObjectiveLevel;
  @ManyToOne(() => Objective, (objective) => objective.childObjectives, {
    nullable: true,
    lazy: true,
  })
  parentObjective: Promise<Objective>;
  @OneToMany(() => Objective, (objective) => objective.parentObjective, {
    lazy: true,
  })
  childObjectives: Promise<Objective[]>;
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
