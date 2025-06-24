export interface ObjectiveDto {
  title: string;
  timeline?: string;
  assignedTo?: string;
  parentObjective?: string;
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
  parentObjective?: string;
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

export interface InitiativeDto {
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
  initiatives: InitiativeDto[];
  org: OrgDto;
  project: {
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
  breadcrumbs?: {
    reference: string;
    type: string;
    id: string;
  }[];
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
    project: {
      id: string;
    };
    parentObjective: {
      id: string;
      reference: string;
      title: string;
    };
    childObjectives: {
      id: string;
      reference: string;
      title: string;
      status: string;
      level: string;
      timeline: string;
      progress: number;
      project: {
        id: string;
        name: string;
      };
      assignedTo: {
        id: string;
        name: string;
      };
      createdAt: Date;
      updatedAt: Date;
    }[];
    reference: string;
    title: string;
    progress: number;
    createdAt: Date;
    updatedAt: Date;
    status: string;
    level: string;
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
