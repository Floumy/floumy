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
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkItemPatchDto {
  iteration?: string;
}
