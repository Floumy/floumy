import { Injectable } from '@nestjs/common';
import { Timeline } from '../../common/timeline.enum';
import { IterationsService } from '../iterations.service';
import { IterationMapper } from './public.mapper';
import { InjectRepository } from '@nestjs/typeorm';
import { Org } from '../../orgs/org.entity';
import { Repository } from 'typeorm';
import { Product } from '../../products/product.entity';

@Injectable()
export class PublicService {
  constructor(
    @InjectRepository(Org) private orgsRepository: Repository<Org>,
    private iterationsService: IterationsService,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  async listIterationsForTimeline(
    orgId: string,
    productId: string,
    timeline: Timeline,
  ) {
    await this.validateOrgHasBuildInPublicEnabled(orgId);

    const iterations = await this.iterationsService.findIterationsForTimeline(
      orgId,
      productId,
      timeline,
    );

    return await Promise.all(
      iterations.map((iteration) => IterationMapper.toDto(iteration)),
    );
  }

  async getIterationById(
    orgId: string,
    productId: string,
    iterationId: string,
  ) {
    await this.validateOrgHasBuildInPublicEnabled(orgId);

    const iteration = await this.iterationsService.findIteration(
      orgId,
      productId,
      iterationId,
    );
    return IterationMapper.toDto(iteration);
  }

  async getActiveIteration(orgId: string, productId: string) {
    const product = await this.productsRepository.findOneByOrFail({
      id: productId,
      org: { id: orgId },
    });

    const bipSettings = await product.bipSettings;
    if (
      !bipSettings ||
      bipSettings.isBuildInPublicEnabled === false ||
      bipSettings.isActiveIterationsPagePublic === false
    ) {
      throw new Error('Building in public is not enabled');
    }

    const iteration = await this.iterationsService.findActiveIteration(
      orgId,
      productId,
    );
    return iteration ? await IterationMapper.toDto(iteration) : null;
  }

  private async validateOrgHasBuildInPublicEnabled(orgId: string) {
    const org = await this.orgsRepository.findOneByOrFail({ id: orgId });
    const bipSettings = await org.bipSettings;

    if (!bipSettings || bipSettings.isBuildInPublicEnabled === false) {
      throw new Error('Building in public is not enabled');
    }
  }
}
