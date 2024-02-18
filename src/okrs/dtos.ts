interface ObjectiveDto {
  title: string;
  timeline?: string;
  assignedTo?: string;
}

interface CreateOrUpdateKRDto {
  id?: string;
  title: string;
  progress?: number;
  status?: string;
}

interface UpdateObjectiveDto {
  title: string;
  status: string;
  timeline?: string;
  assignedTo?: string;
}

interface CreateOrUpdateOKRDto {
  objective: ObjectiveDto;
  keyResults?: CreateOrUpdateKRDto[];
}

interface PatchKeyResultDto {
  title?: string;
  progress?: number;
  status?: string;
}

interface CreateOrUpdateKeyResultDto {
  title: string;
  progress: number;
  status: string;
}

interface PatchObjectiveDto {
  title?: string;
  status?: string;
  timeline?: string;
  assignedTo?: string;
}

interface FeatureDto {
  id: string;
  title: string;
  priority: string;
  status: string;
  workItemsCount: number;
  progress: number;
  workItems?: WorkItemDto[];
  createdAt: Date;
  updatedAt: Date;
}

interface WorkItemDto {
  id: string;
  title: string;
  description: string;
  priority: string;
  type: string;
  status: string;
  estimation: number;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface KeyResultDto {
  features: FeatureDto[];
  id: string;
  title: string;
  progress: number;
  timeline: string;
  createdAt: Date;
  updatedAt: Date;
  status: string;
}
