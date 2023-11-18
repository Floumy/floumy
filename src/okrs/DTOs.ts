interface ObjectiveDto {
  title: string;
  description: string;
}

interface CreateOrUpdateOKRDto {
  objective: ObjectiveDto;
  keyResults?: { id?: string, title: string }[];
}

interface UpdateKeyResultDto {
  progress?: number;
}
