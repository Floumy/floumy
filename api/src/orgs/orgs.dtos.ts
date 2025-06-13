export interface MemberDto {
  id: string;
  name: string;
  role: string;
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
  hadDemo: boolean;
}

export interface ProjectDto {
  id: string;
  name: string;
}
