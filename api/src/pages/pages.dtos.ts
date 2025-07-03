export class UpdatePageDto {
  title?: string;
  content?: string;
  parentId?: string;
}

export class CreatePageDto {
  parentId?: string;
}
