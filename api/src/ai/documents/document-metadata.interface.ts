export interface DocumentMetadata {
  orgId: string;
  documentType: string;
  userId?: string;
  projectId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
