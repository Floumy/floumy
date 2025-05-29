import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Project } from '../projects/project.entity';
import { WorkItem } from '../backlog/work-items/work-item.entity';
import { Org } from '../orgs/org.entity';

@Entity()
export class GithubPullRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ nullable: true })
  githubId: string;
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
  @ManyToOne(() => Project, (project) => project.githubPullRequests, {
    lazy: true,
  })
  project: Promise<Project>;
  @ManyToOne(() => Org, (org) => org.githubPullRequests, { lazy: true })
  org: Promise<Org>;
  @ManyToOne(() => WorkItem, (workItem) => workItem.githubPullRequests, {
    lazy: true,
  })
  workItem: Promise<WorkItem>;
  @Column({ nullable: true })
  mergedAt: Date;
  @Column({ nullable: true })
  closedAt: Date;
  @Column({ nullable: true })
  approvedAt: Date;
}
