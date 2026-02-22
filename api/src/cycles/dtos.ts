export interface CreateOrUpdateCycleDto {
  goal: string;
  startDate: string;
  duration: number;
}

export interface CycleDto {
  id: string;
  title: string;
  goal: string;
  startDate: string;
  endDate: string;
  duration: number;
  createdAt: Date;
  updatedAt: Date;
}
