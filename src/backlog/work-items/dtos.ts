import { Priority } from "../../common/priority.enum";
import { WorkItemType } from "./work-item-type.enum";
import { WorkItemStatus } from "./workt-item-status.enum";

export interface CreateUpdateWorkItemDto {
  title: string;
  description: string;
  priority: Priority;
  type: WorkItemType;
  feature?: string;
}

export interface WorkItemDto {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  type: WorkItemType;
  status: WorkItemStatus;
  feature?: {
    id: string;
    title: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
