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
  members: MemberDto[];
}
