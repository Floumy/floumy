
interface ObjectiveDto {
  title: string;
  timeline?: string;
}

interface CreateOrUpdateKRDto {
  id?: string;
  title: string;
  progress?: number;
  status?: string;
}

interface CreateOrUpdateOKRDto {
  objective: ObjectiveDto;
  keyResults?: CreateOrUpdateKRDto[];
}

interface PatchKeyResultDto {
  progress?: number;
  status?: string;
}

interface PatchObjectiveDto {
  status?: string;
}

interface KeyResultDto {
  id: string;
  title: string;
  progress: number;
  timeline: string;
  createdAt: Date;
  updatedAt: Date;
  status: string;
}
