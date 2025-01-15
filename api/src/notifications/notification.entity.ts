import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Project } from '../projects/project.entity';
import { Org } from '../orgs/org.entity';

export enum EntityType {
  INITIATIVE_COMMENT = 'initiative_comment',
  INITIATIVE_DESCRIPTION = 'initiative_description',
  FEATURE_REQUEST_COMMENT = 'feature_request_comment',
  ISSUE_COMMENT = 'issue_comment',
  KEY_RESULT_COMMENT = 'key_result_comment',
  OBJECTIVE_COMMENT = 'objective_comment',
  WORK_ITEM_COMMENT = 'work_item_comment',
  WORK_ITEM_DESCRIPTION = 'work_item_description',
}

export enum ActionType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
}

export enum StatusType {
  UNREAD = 'unread',
  READ = 'read',
}

@Entity()
@Unique(['entityId', 'user'])
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({
    type: 'enum',
    enum: EntityType,
  })
  entity: EntityType;
  @Column({
    type: 'enum',
    enum: ActionType,
  })
  action: ActionType;
  @Column({
    type: 'enum',
    enum: StatusType,
  })
  status: StatusType;
  @Column()
  entityId: string;
  @ManyToOne(() => User, (user) => user.createdNotifications)
  createdBy: Promise<User>;
  @ManyToOne(() => User, (user) => user.notifications)
  user: Promise<User>;
  @ManyToOne(() => Project, (project) => project.notifications)
  project: Promise<Project>;
  @ManyToOne(() => Org, (org) => org.notifications)
  org: Promise<Org>;
  @CreateDateColumn()
  createdAt: Date;
}
