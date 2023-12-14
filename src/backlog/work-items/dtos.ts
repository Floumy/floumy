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
}

export interface WorkItemDto {
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
  createdAt: Date;
  updatedAt: Date;
}
