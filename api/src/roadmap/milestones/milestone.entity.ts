import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Org } from '../../orgs/org.entity';
import { Initiative } from '../initiatives/initiative.entity';
import { Project } from '../../projects/project.entity';

@Entity()
export class Milestone {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  title: string;
  @Column()
  description: string;
  @Column()
  dueDate: Date;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @ManyToOne(() => Org, (org) => org.milestones, { lazy: true })
  org: Promise<Org>;
  @OneToMany(() => Initiative, (initiative) => initiative.milestone, { lazy: true })
  initiatives: Promise<Initiative[]>;
  @ManyToOne(() => Project, (project) => project.milestones, { lazy: true })
  project: Promise<Project>;
}
