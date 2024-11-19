import { User } from '../users/user.entity';
import { MemberDto, OrgDto, ProductDto } from './orgs.dtos';
import { Org } from './org.entity';
import { Product } from '../products/product.entity';

export class MembersMapper {
  static toMembers(members: User[]): MemberDto[] {
    return members.map(MembersMapper.toMember);
  }

  static toMember(member: User): MemberDto {
    return {
      id: member.id,
      name: member.name,
      email: member.email,
      isActive: member.isActive,
      createdAt: member.createdAt,
    };
  }
}

export class ProductMapper {
  static toProduct(product: Product): ProductDto {
    return {
      id: product.id,
      name: product.name,
    };
  }
}

export class OrgsMapper {
  static async toOrg(org: Org): Promise<OrgDto> {
    const products = await org.products;
    return {
      id: org.id,
      name: org.name,
      invitationToken: org.invitationToken,
      paymentPlan: org.paymentPlan,
      isSubscribed: org.isSubscribed,
      nextPaymentDate: org.nextPaymentDate,
      createdAt: org.createdAt,
      updatedAt: org.updatedAt,
      products: products.map(ProductMapper.toProduct),
      members: MembersMapper.toMembers(await org.users),
    };
  }
}
