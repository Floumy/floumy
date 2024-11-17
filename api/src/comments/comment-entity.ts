import {
  Column,
  CreateDateColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Org } from '../orgs/org.entity';

export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  content: string;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @ManyToOne(() => User, (user) => user.createdWorkItems, { lazy: false })
  createdBy: Promise<User>;
  @ManyToOne(() => Org, (org) => org.workItems, { lazy: false })
  org: Promise<Org>;
}
