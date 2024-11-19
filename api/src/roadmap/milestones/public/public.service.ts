import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Timeline } from '../../../common/timeline.enum';
import { MilestonesService } from '../milestones.service';
import { PublicMilestoneMapper } from './public.mappers';
import { Product } from '../../../products/product.entity';

@Injectable()
export class PublicService {
  constructor(
    private milestoneService: MilestonesService,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  async listMilestones(orgId: string, productId: string, timeline: Timeline) {
    await this.validateBuildInPublicSettings(orgId, productId);
    return this.milestoneService.listForTimeline(orgId, productId, timeline);
  }

  async findMilestone(orgId: string, productId: string, milestoneId: string) {
    await this.validateBuildInPublicSettings(orgId, productId);
    const milestone = await this.milestoneService.findOneById(
      orgId,
      productId,
      milestoneId,
    );
    return await PublicMilestoneMapper.toDto(milestone);
  }

  private async validateBuildInPublicSettings(
    orgId: string,
    productId: string,
  ) {
    const product = await this.productsRepository.findOneByOrFail({
      id: productId,
      org: { id: orgId },
    });
    const bipSettings = await product.bipSettings;
    if (
      !bipSettings?.isRoadmapPagePublic ||
      !bipSettings?.isBuildInPublicEnabled
    ) {
      throw new Error('Roadmap page is not public');
    }
  }
}
