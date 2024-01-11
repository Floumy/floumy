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
  createdAt: Date;
  updatedAt: Date;
}

export interface MilestoneListItemDto {
  id: string;
  title: string;
  dueDate: string;
}

export interface MilestoneListWithFeaturesItemDto {
  id: string;
  title: string;
  dueDate: string;
  timeline: string;
  features: FeatureListItemDto[];
}

export interface FeatureListItemDto {
  id: string;
  title: string;
  priority: string;
  status: string;
  progress: number;
  workItemsCount: number;
  createdAt: Date;
  updatedAt: Date;
}
