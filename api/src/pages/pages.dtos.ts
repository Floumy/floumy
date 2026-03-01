export class UpdatePageDto {
  title?: string | null;
  content?: string | null;
  parentId?: string | null;
}

export class CreatePageDto {
  parentId?: string | null;
}
