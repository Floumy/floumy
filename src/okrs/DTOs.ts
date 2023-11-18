interface ObjectiveDto {
  title: string;
  description: string;
}

interface CreateOrUpdateOKRDto {
  objective: ObjectiveDto;
  keyResults?: { id?: string, title: string }[];
}

interface PatchKeyResultDto {
  progress?: number;
  status?: string;
}

interface PatchObjectiveDto {
  status?: string;
}
