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
import { Product } from '../products/product.entity';

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
  isIterationsPagePublic: boolean = false;
  @Column({ default: false })
  isActiveIterationsPagePublic: boolean = false;
  @Column({ default: false })
  isFeedPagePublic: boolean = false;
  @Column({ default: false })
  isIssuesPagePublic: boolean = false;
  @Column({ default: false })
  isFeatureRequestsPagePublic: boolean = false;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @OneToOne(() => Product, (product) => product.bipSettings, { lazy: false })
  @JoinColumn()
  product: Promise<Product>;
}
