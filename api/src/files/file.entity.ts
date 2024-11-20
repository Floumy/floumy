import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Org } from '../orgs/org.entity';
import { WorkItemFile } from '../backlog/work-items/work-item-file.entity';
import { Project } from '../projects/project.entity';

@Entity()
export class File {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  type: string;

  @Column()
  size: number;

  @Column()
  path: string;

  @Column()
  url: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Org, (org) => org.files, { lazy: true })
  org: Promise<Org>;

  @OneToOne(() => WorkItemFile)
  workItemFiles: Promise<WorkItemFile>;

  @ManyToOne(() => Project, (project) => project.files, { lazy: false })
  project: Promise<Project>;
}
