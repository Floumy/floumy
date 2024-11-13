import { Org } from '../org.entity';
import { PublicOrgDto } from './dtos';
import { Product } from '../../products/product.entity';

class ProductMapper {
  static toProduct(product: Product): { id: string; name: string } {
    return {
      id: product.id,
      name: product.name,
    };
  }
}

export class PublicMapper {
  public static async toPublicOrg(org: Org): Promise<PublicOrgDto> {
    const products = await org.products;
    return {
      id: org.id,
      name: org.name,
      paymentPlan: org.paymentPlan,
      products: products.map(ProductMapper.toProduct),
      createdAt: org.createdAt,
      updatedAt: org.updatedAt,
    };
  }
}
