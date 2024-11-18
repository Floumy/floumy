import { PaymentPlan } from '../../auth/payment.plan';
import { ProductDto } from '../orgs.dtos';

export interface PublicOrgDto {
  id: string;
  name: string;
  paymentPlan: PaymentPlan;
  products: ProductDto[];
  createdAt: Date;
  updatedAt: Date;
}
