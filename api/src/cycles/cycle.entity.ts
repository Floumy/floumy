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
import { CycleStatus } from './cycle-status.enum';
import { Project } from '../projects/project.entity';

@Entity('cycle')
export class Cycle {
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
    enum: CycleStatus,
    default: CycleStatus.PLANNED,
  })
  status: CycleStatus;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @ManyToOne(() => Org, (org) => org.cycles, { lazy: true })
  org: Promise<Org>;
  @OneToMany(() => WorkItem, (workItem) => workItem.cycle, { lazy: false })
  workItems: Promise<WorkItem[]>;
  @ManyToOne(() => Project, (project) => project.cycles, { lazy: false })
  project: Promise<Project>;
}
