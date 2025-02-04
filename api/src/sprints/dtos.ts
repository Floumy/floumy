export interface CreateOrUpdateSprintDto {
  goal: string;
  startDate: string;
  duration: number;
}

export interface SprintDto {
  id: string;
  title: string;
  goal: string;
  startDate: string;
  endDate: string;
  duration: number;
  createdAt: Date;
  updatedAt: Date;
}
