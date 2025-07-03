export class UpdateWikiPageDto {
  title?: string;
  content?: string;
  parentId?: string;
}

export class CreateWikiPageDto {
  parentId?: string;
}
