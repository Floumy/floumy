import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Project } from '../projects/project.entity';
import { WorkItem } from '../backlog/work-items/work-item.entity';
import { Org } from '../orgs/org.entity';

@Entity()
export class GitlabPullRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ nullable: true })
  gitlabId: string;
  @Column()
  title: string;
  @Column()
  url: string;
  @Column()
  state: string;
  @Column()
  createdAt: Date;
  @Column()
  updatedAt: Date;
  @ManyToOne(() => Project, (project) => project.gitlabPullRequests, {
    lazy: true,
  })
  project: Promise<Project>;
  @ManyToOne(() => Org, (org) => org.gitlabPullRequests, { lazy: true })
  org: Promise<Org>;
  @ManyToOne(() => WorkItem, (workItem) => workItem.gitlabPullRequests, {
    lazy: true,
  })
  workItem: Promise<WorkItem>;
}
