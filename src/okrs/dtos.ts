interface ObjectiveDto {
  title: string;
  timeline?: string;
}

interface CreateOrUpdateKRDto {
  id?: string;
  title: string;
  progress?: number;
  status?: string;
}

interface CreateOrUpdateOKRDto {
  objective: ObjectiveDto;
  keyResults?: CreateOrUpdateKRDto[];
}

interface PatchKeyResultDto {
  progress?: number;
  status?: string;
}

interface PatchObjectiveDto {
  status?: string;
}

interface FeatureDto {
  id: string;
  title: string;
  priority: string;
  status: string;
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
