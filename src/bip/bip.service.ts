import { Injectable } from '@nestjs/common';
import { BipSettingsDto } from './bip.dtos';
import { Repository } from 'typeorm';
import { BipSettings } from './bip-settings.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { BipSettingsMapper } from './bip.dtos.mapper';
import { Org } from '../orgs/org.entity';
import { OnEvent } from '@nestjs/event-emitter';
import { Product } from '../products/product.entity';

@Injectable()
export class BipService {
  constructor(
    @InjectRepository(BipSettings)
    private readonly bipSettingsRepository: Repository<BipSettings>,
    @InjectRepository(Org)
    private readonly orgRepository: Repository<Org>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  async createOrUpdateSettings(
    orgId: string,
    productId: string,
    settings: BipSettingsDto,
  ) {
    const org = await this.orgRepository.findOneByOrFail({ id: orgId });

    const product = await this.productsRepository.findOneByOrFail({
      id: productId,
      org: { id: orgId },
    });

    return await this.createOrUpdateBuildInPublicSettings(
      org,
      product,
      settings,
    );
  }

  async getSettings(orgId: string) {
    const bipSettings = await this.bipSettingsRepository.findOneByOrFail({
      org: { id: orgId },
    });
    return BipSettingsMapper.toDto(bipSettings);
  }

  // TODO: Extract this in an event handler class
  @OnEvent('org.created')
  async createSettings(eventOrg: Org) {
    const org = await this.orgRepository.findOneBy({ id: eventOrg.id });
    if (!org) {
      return;
    }
    if (await org.bipSettings) {
      return;
    }

    const bipSettings = new BipSettings();
    bipSettings.org = Promise.resolve(org);
    const product = (await org.products)[0];
    // TODO: This is a temporary solution to set the product
    bipSettings.product = Promise.resolve(product);
    await this.bipSettingsRepository.save(bipSettings);
  }

  async createOrUpdateBuildInPublicSettings(
    org: Org,
    product: Product,
    settings: BipSettingsDto,
  ) {
    let bipSettings = await this.bipSettingsRepository.findOneBy({
      org: { id: org.id },
      product: { id: product.id },
    });

    if (!bipSettings) {
      bipSettings = new BipSettings();
    }
    bipSettings.org = Promise.resolve(org);
    bipSettings.product = Promise.resolve(product);
    bipSettings.isBuildInPublicEnabled = settings.isBuildInPublicEnabled;
    bipSettings.isObjectivesPagePublic = settings.isObjectivesPagePublic;
    bipSettings.isRoadmapPagePublic = settings.isRoadmapPagePublic;
    bipSettings.isIterationsPagePublic = settings.isIterationsPagePublic;
    bipSettings.isActiveIterationsPagePublic =
      settings.isActiveIterationsPagePublic;
    bipSettings.isFeedPagePublic = settings.isFeedPagePublic;
    bipSettings.isFeatureRequestsPagePublic =
      settings.isFeatureRequestsPagePublic;
    bipSettings.isIssuesPagePublic = settings.isIssuesPagePublic;
    const updatedSettings = await this.bipSettingsRepository.save(bipSettings);
    return BipSettingsMapper.toDto(updatedSettings);
  }
}
