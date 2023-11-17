interface ObjectiveDto {
  title: string;
  description: string;
}

interface CreateOrUpdateOKRDto {
  objective: ObjectiveDto;
  keyResults?: { title: string }[];
}

interface UpdateKeyResultDto {
  progress?: number;
}
