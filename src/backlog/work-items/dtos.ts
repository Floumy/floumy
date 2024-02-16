import { Priority } from "../../common/priority.enum";
import { WorkItemType } from "./work-item-type.enum";
import { WorkItemStatus } from "./work-item-status.enum";

export interface CreateUpdateWorkItemDto {
  title: string;
  description: string;
  priority: Priority;
  type: WorkItemType;
  status: WorkItemStatus;
  estimation?: number;
  feature?: string;
  iteration?: string;
  assignedTo?: string;
  files?: { id: string; }[];
}

export interface WorkItemDto {
  completedAt: Date;
  id: string;
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
