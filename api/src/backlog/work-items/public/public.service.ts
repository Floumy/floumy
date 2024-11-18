import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PublicWorkItemMapper } from './public.mappers';
import { Product } from '../../../products/product.entity';
import { WorkItem } from '../work-item.entity';

@Injectable()
export class PublicService {
  constructor(
    @InjectRepository(WorkItem)
    private workItemsRepository: Repository<WorkItem>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  async getWorkItem(orgId: string, productId: string, workItemId: string) {
    const product = await this.productsRepository.findOneByOrFail({
      id: productId,
      org: { id: orgId },
    });

    const bipSettings = await product.bipSettings;
    if (!bipSettings?.isBuildInPublicEnabled) {
      throw new NotFoundException();
    }
    const workItem = await this.workItemsRepository.findOneByOrFail({
      id: workItemId,
      org: { id: orgId },
      product: { id: productId },
    });
    return PublicWorkItemMapper.toDto(workItem);
  }
}
