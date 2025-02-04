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
import { WorkItem } from '../backlog/work-items/work-item.entity';
import { SprintStatus } from './sprint-status.enum';
import { Project } from '../projects/project.entity';

@Entity()
export class Sprint {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  title: string;
  @Column()
  goal: string;
  @Column()
  startDate: Date;
  @Column()
  endDate: Date;
  @Column({ nullable: true })
  actualStartDate: Date;
  @Column({ nullable: true })
  actualEndDate: Date;
  @Column()
  duration: number;
  @Column({ nullable: true })
  velocity: number;
  @Column({
    type: 'enum',
    enum: SprintStatus,
    default: SprintStatus.PLANNED,
  })
  status: SprintStatus;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @ManyToOne(() => Org, (org) => org.sprints, { lazy: true })
  org: Promise<Org>;
  @OneToMany(() => WorkItem, (workItem) => workItem.sprint, { lazy: false })
  workItems: Promise<WorkItem[]>;
  @ManyToOne(() => Project, (project) => project.sprints, { lazy: false })
  project: Promise<Project>;
}
