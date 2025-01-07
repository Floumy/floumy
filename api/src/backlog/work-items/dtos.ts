import { Priority } from '../../common/priority.enum';
import { WorkItemType } from './work-item-type.enum';
import { WorkItemStatus } from './work-item-status.enum';

export interface CreateUpdateWorkItemDto {
  title: string;
  description: string;
  mentions?: string[];
  priority: Priority;
  type: WorkItemType;
  status: WorkItemStatus;
  estimation?: number;
  feature?: string;
  iteration?: string;
  assignedTo?: string;
  issue?: string;
  files?: { id: string }[];
}

export interface WorkItemDto {
  project: {
    id: string;
  };
  completedAt: Date;
  id: string;
  org?: {
    id: string;
  };
  reference: string;
  title: string;
  description: string;
  priority: Priority;
  type: WorkItemType;
  status: WorkItemStatus;
  estimation?: number;
  feature?: {
    id: string;
    title: string;
  };
  iteration?: {
    id: string;
    title: string;
  };
  files?: {
    id: string;
    name: string;
    size: number;
    type: string;
  }[];
  issue?: {
    id: string;
    title: string;
  };
  createdBy: UserDto;
  assignedTo: UserDto;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkItemPatchDto {
  iteration?: string;
  status?: WorkItemStatus;
  priority?: Priority;
}

export interface UserDto {
  id: string;
  name: string;
}

export interface SearchWorkItem {
  id: string;
  reference: string;
  title: string;
  description: string;
  priority: Priority;
  type: WorkItemType;
  status: WorkItemStatus;
  assignedToId: string;
  assignedToName: string;
  estimation: number;
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchWorkItemDto {
  id: string;
  reference: string;
  title: string;
  description: string;
  priority: Priority;
  type: WorkItemType;
  status: WorkItemStatus;
  estimation: number;
  completedAt: Date;
  assignedTo: {
    id: string;
    name: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
