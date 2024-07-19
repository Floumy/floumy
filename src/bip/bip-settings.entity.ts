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

@Entity()
export class BipSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @OneToOne(() => Org, (org) => org.bipSettings, { lazy: false })
  @JoinColumn()
  org: Promise<Org>;
  @Column({ default: false })
  isBuildInPublicEnabled: boolean;
  @Column({ default: false })
  isObjectivesPagePublic: boolean;
  @Column({ default: false })
  isRoadmapPagePublic: boolean;
  @Column({ default: false })
  isIterationsPagePublic: boolean;
  @Column({ default: false })
  isActiveIterationsPagePublic: boolean;
  @Column({ default: false })
  isFeedPagePublic: boolean;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
}
