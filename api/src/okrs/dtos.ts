export interface ObjectiveDto {
  title: string;
  timeline?: string;
  assignedTo?: string;
}

export interface CreateOrUpdateKRDto {
  id?: string;
  title: string;
  progress?: number;
  status?: string;
}

export interface UpdateObjectiveDto {
  title: string;
  status: string;
  timeline?: string;
  assignedTo?: string;
}

export interface CreateOrUpdateOKRDto {
  objective: ObjectiveDto;
  keyResults?: CreateOrUpdateKRDto[];
}

export interface PatchKeyResultDto {
  title?: string;
  progress?: number;
  status?: string;
}

export interface CreateOrUpdateKeyResultDto {
  title: string;
  progress: number;
  status: string;
}

export interface FeatureDto {
  id: string;
  reference: string;
  title: string;
  priority: string;
  status: string;
  workItemsCount: number;
  progress: number;
  workItems?: WorkItemDto[];
  assignedTo?: { id: string; name: string };
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkItemDto {
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

export interface OrgDto {
  id: string;
  name: string;
}

export interface KeyResultDto {
  features: FeatureDto[];
  org: OrgDto;
  product: {
    id: string;
  };
  objective: {
    id: string;
    reference: string;
    title: string;
  };
  id: string;
  reference: string;
  title: string;
  progress: number;
  timeline: string;
  createdAt: Date;
  updatedAt: Date;
  status: string;
}

export interface OKRDto {
  objective: {
    id: string;
    org: {
      id: string;
      name: string;
    };
    product: {
      id: string;
    };
    reference: string;
    title: string;
    progress: number;
    createdAt: Date;
    updatedAt: Date;
    status: string;
    timeline: string;
    startDate: Date;
    endDate: Date;
    assignedTo: {
      id: string;
      name: string;
    };
  };
  keyResults: KeyResultDto[];
}
