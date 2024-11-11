import { PaymentPlan } from '../../auth/payment.plan';

export interface PublicOrgDto {
  id: string;
  name: string;
  paymentPlan: PaymentPlan;
  createdAt: Date;
  updatedAt: Date;
}
