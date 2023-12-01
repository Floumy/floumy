export interface CreateMilestoneDto {
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
