export interface CommentDto {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: {
    id: string;
    name: string;
  };
}

export interface CreateUpdateCommentDto {
  content: string;
  mentions: string[];
}
