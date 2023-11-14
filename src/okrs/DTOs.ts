interface ObjectiveDto {
  title: string;
  description: string;
}

interface OKRDto {
  objective: ObjectiveDto;
  keyResults?: string[];
}
