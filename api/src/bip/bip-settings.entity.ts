import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Org } from '../orgs/org.entity';
import { Project } from '../projects/project.entity';

@Entity()
export class BipSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @OneToOne(() => Org, (org) => org.bipSettings, { lazy: false })
  @JoinColumn()
  org: Promise<Org>;
  @Column({ default: false })
  isBuildInPublicEnabled: boolean = false;
  @Column({ default: false })
  isObjectivesPagePublic: boolean = false;
  @Column({ default: false })
  isRoadmapPagePublic: boolean = false;
  @Column({ default: false })
  isCyclesPagePublic: boolean = false;
  @Column({ default: false })
  isActiveCyclesPagePublic: boolean = false;
  @Column({ default: false })
  isActiveWorkPagePublic: boolean = false;
  @Column({ default: false })
  isIssuesPagePublic: boolean = false;
  @Column({ default: false })
  isRequestsPagePublic: boolean = false;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @OneToOne(() => Project, (project) => project.bipSettings, { lazy: false })
  @JoinColumn()
  project: Promise<Project>;
}
