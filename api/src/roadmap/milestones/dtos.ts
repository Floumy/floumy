export interface CreateUpdateMilestoneDto {
  title: string;
  description: string;
  dueDate: string;
}

export interface MilestoneDto {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  timeline: string;
  initiatives: InitiativeListItemDto[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MilestoneListItemDto {
  id: string;
  title: string;
  dueDate: string;
}

export interface MilestoneListWithInitiativesItemDto {
  id: string;
  title: string;
  dueDate: string;
  timeline: string;
  initiatives: InitiativeListItemDto[];
}

export interface InitiativeListItemDto {
  id: string;
  title: string;
  priority: string;
  status: string;
  progress: number;
  workItemsCount: number;
  createdAt: Date;
  updatedAt: Date;
}
