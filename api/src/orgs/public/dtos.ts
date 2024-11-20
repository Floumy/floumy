import { PaymentPlan } from '../../auth/payment.plan';
import { ProjectDto } from '../orgs.dtos';

export interface PublicOrgDto {
  id: string;
  name: string;
  paymentPlan: PaymentPlan;
  projects: ProjectDto[];
  createdAt: Date;
  updatedAt: Date;
}
