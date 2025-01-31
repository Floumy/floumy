import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Project } from '../projects/project.entity';
import { WorkItem } from '../backlog/work-items/work-item.entity';
import { Org } from '../orgs/org.entity';

@Entity()
export class GithubBranch {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  name: string;
  @Column()
  url: string;
  @Column()
  state: string;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @ManyToOne(() => Project, (project) => project.githubBranches, { lazy: true })
  project: Promise<Project>;
  @ManyToOne(() => Org, (org) => org.githubBranches, { lazy: true })
  org: Promise<Org>;
  @ManyToOne(() => WorkItem, (workItem) => workItem.githubBranches, {
    lazy: true,
  })
  workItem: Promise<WorkItem>;
}
