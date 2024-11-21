import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Objective } from './objective.entity';
import { Org } from '../orgs/org.entity';
import { Feature } from '../roadmap/features/feature.entity';
import { OKRStatus } from './okrstatus.enum';
import { KeyResultComment } from './key-result-comment.entity';
import { Project } from '../projects/project.entity';

@Entity()
export class KeyResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  title: string;
  @Column({ default: 0, type: 'float' })
  progress: number;
  @Column({
    type: 'enum',
    enum: OKRStatus,
    default: OKRStatus.ON_TRACK,
  })
  status: OKRStatus;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @Column({
    type: 'int',
    nullable: false,
    unique: true,
  })
  sequenceNumber: number;
  @ManyToOne(() => Org, (org) => org.keyResults, { lazy: true })
  org: Promise<Org>;
  @ManyToOne(() => Objective, (objective) => objective.keyResults, {
    lazy: true,
  })
  objective: Promise<Objective>;
  @OneToMany(() => Feature, (feature) => feature.keyResult, { lazy: true })
  features: Promise<Feature[]>;
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
