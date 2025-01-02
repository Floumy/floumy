import { ActionType, EntityType, StatusType } from './notification.entity';
import { User } from '../users/user.entity';
import { Project } from '../projects/project.entity';
import { Org } from '../orgs/org.entity';

export interface CreateNotificationDto {
  entity: EntityType;
  action: ActionType;
  status: StatusType;
  createdBy: User;
  entityId: string;
  mentions: User[];
  project: Project;
  org: Org;
}

export interface ViewNotificationDto {
  id: string;
  entity: EntityType;
  action: ActionType;
  status: StatusType;
  entityId: string;
  entityName: string;
  createdAt: Date;
  createdBy: User;
}
