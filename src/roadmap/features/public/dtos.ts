export interface FeatureDto {
  id: string;
  reference: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  progress: number;
  workItemsCount: number;
  workItems: WorkItemDto[];
  createdAt: string;
  updatedAt: string;
  keyResult: KeyResultDto;
  milestone: MilestoneDto;
}

export interface WorkItemDto {
  id: string;
  reference: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  type: string;
  estimation: string;
  createdAt: string;
  updatedAt: string;
}

export interface KeyResultDto {
  id: string;
  title: string;
}

export interface MilestoneDto {
  id: string;
  title: string;
  dueDate: string;
}
