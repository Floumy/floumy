import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Org } from '../orgs/org.entity';
import { User } from '../users/user.entity';

@Entity()
export class FeedItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  title: string;
  @Column()
  entity: string;
  @Column()
  entityId: string;
  @Column()
  action: string;
  @Column({ type: 'json' })
  content: any;
  @ManyToOne(() => User, (user) => user.feedItems, { lazy: false })
  user: Promise<User>;
  @ManyToOne(() => Org, (org) => org.feedItems, { lazy: false })
  org: Promise<Org>;
  @CreateDateColumn()
  createdAt: Date;
}
