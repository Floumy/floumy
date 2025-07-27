export interface DocumentMetadata {
  entityId: string;
  orgId: string;
  documentType: string;
  userId?: string;
  projectId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  chunkIndex?: number;
  totalChunks?: number;
}
