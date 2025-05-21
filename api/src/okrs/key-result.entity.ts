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
import { Objective } from './objective.entity';
import { Org } from '../orgs/org.entity';
import { Initiative } from '../roadmap/initiatives/initiative.entity';
import { ObjectiveStatus } from './okrstatus.enum';
import { KeyResultComment } from './key-result-comment.entity';
import { Project } from '../projects/project.entity';

@Entity()
@Unique(['reference', 'org'])
export class KeyResult {
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
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @Column({
    nullable: false,
  })
  reference: string;
  @ManyToOne(() => Org, (org) => org.keyResults, { lazy: true })
  org: Promise<Org>;
  @ManyToOne(() => Objective, (objective) => objective.keyResults, {
    lazy: true,
  })
  objective: Promise<Objective>;
  @OneToMany(() => Initiative, (feature) => feature.keyResult, { lazy: true })
  initiatives: Promise<Initiative[]>;
  @OneToMany(
    () => KeyResultComment,
    (keyResultComment) => keyResultComment.keyResult,
    {
      lazy: true,
    },
  )
  comments: Promise<KeyResultComment[]>;
  @ManyToOne(() => Project, (project) => project.keyResults, { lazy: true })
  project: Promise<Project>;
}
