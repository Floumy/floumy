export interface MemberDto {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: Date;
}

export interface OrgDto {
  id: string;
  name: string;
  invitationToken: string;
  paymentPlan: string;
  isSubscribed: boolean;
  nextPaymentDate: Date;
  createdAt: Date;
  updatedAt: Date;
  projects: ProjectDto[];
  members: MemberDto[];
}

export interface ProjectDto {
  id: string;
  name: string;
}
