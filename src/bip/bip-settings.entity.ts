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
  @Column({ default: true })
  isBuildInPublicEnabled: boolean = true;
  @Column({ default: true })
  isObjectivesPagePublic: boolean = true;
  @Column({ default: true })
  isRoadmapPagePublic: boolean = true;
  @Column({ default: true })
  isIterationsPagePublic: boolean = true;
  @Column({ default: true })
  isActiveIterationsPagePublic: boolean = true;
  @Column({ default: true })
  isFeedPagePublic: boolean = true;
  @Column({ default: false })
  isIssuesPagePublic: boolean = false;
  @Column({ default: false })
  isFeatureRequestsPagePublic: boolean = false;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  // TODO: Implement this relationship
  @OneToOne(() => Product, (product) => product.bipSettings, { lazy: false })
  @JoinColumn()
  product: Promise<Product>;
}
