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

export interface CreateCommentDto {
  content: string;
}
