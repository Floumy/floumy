export interface WorkItemDto {
  id: string;
  reference: string;
  title: string;
  description: string;
  priority: string;
  type: string;
  status: string;
  estimation: number;
  feature: {
    id: string;
    title: string;
  };
  sprint: {
    id: string;
    title: string;
  };
  completedAt: string;
  createdAt: string;
  updatedAt: string;
}
