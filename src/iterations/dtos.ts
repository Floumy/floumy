export interface CreateOrUpdateIterationDto {
  goal: string;
  startDate: string;
  duration: number;
}

export interface IterationDto {
  id: string;
  title: string;
  goal: string;
  startDate: string;
  endDate: string;
  duration: number;
  createdAt: Date;
  updatedAt: Date;
}
