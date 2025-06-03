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
export class GitlabBranch {
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
  @Column({ nullable: true })
  deletedAt: Date;
  @ManyToOne(() => Project, (project) => project.gitlabBranches, { lazy: true })
  project: Promise<Project>;
  @ManyToOne(() => Org, (org) => org.gitlabBranches, { lazy: true })
  org: Promise<Org>;
  @ManyToOne(() => WorkItem, (workItem) => workItem.gitlabBranches, {
    lazy: true,
  })
  workItem: Promise<WorkItem>;
}
