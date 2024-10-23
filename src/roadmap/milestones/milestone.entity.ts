import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Org } from '../../orgs/org.entity';
import { Feature } from '../features/feature.entity';
import { Product } from '../../products/product.entity';

@Entity()
export class Milestone {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  title: string;
  @Column()
  description: string;
  @Column()
  dueDate: Date;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @ManyToOne(() => Org, (org) => org.milestones, { lazy: true })
  org: Promise<Org>;
  @OneToMany(() => Feature, (feature) => feature.milestone, { lazy: true })
  features: Promise<Feature[]>;
  @ManyToOne(() => Product, (product) => product.milestones, { lazy: true })
  product: Promise<Product>;
}
