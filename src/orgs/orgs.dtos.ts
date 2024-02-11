export interface MemberDto {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: Date;
}

export interface OrgDto {
  id: string;
  invitationToken: string;
  createdAt: Date;
  updatedAt: Date;
  members: MemberDto[];
}
