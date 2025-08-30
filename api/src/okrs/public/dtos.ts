export interface ObjectiveDto {
  id: string;
  reference: string;
  title: string;
  timeline: string;
  progress: number;
  status: string;
  keyResults: ObjectiveKeyResultDto[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ObjectiveKeyResultDto {
  id: string;
  reference: string;
  title: string;
  progress: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
