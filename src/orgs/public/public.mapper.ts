import { Org } from '../org.entity';
import { PublicOrgDto } from './dtos';

export class PublicMapper {
  public static toPublicOrg(org: Org): PublicOrgDto {
    return {
      id: org.id,
      name: org.name,
      paymentPlan: org.paymentPlan,
      createdAt: org.createdAt,
      updatedAt: org.updatedAt,
    };
  }
}
