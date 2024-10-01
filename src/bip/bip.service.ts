import { Injectable } from '@nestjs/common';
import { BipSettingsDto } from './bip.dtos';
import { Repository } from 'typeorm';
import { BipSettings } from './bip-settings.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { BipSettingsMapper } from './bip.dtos.mapper';
import { Org } from '../orgs/org.entity';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class BipService {
  constructor(
    @InjectRepository(BipSettings)
    private bipSettingsRepository: Repository<BipSettings>,
    @InjectRepository(Org)
    private orgRepository: Repository<Org>,
  ) {}

  async createOrUpdateSettings(orgId: string, settings: BipSettingsDto) {
    const org = await this.orgRepository.findOneByOrFail({ id: orgId });

    if (org.paymentPlan === 'build-in-private') {
      throw new Error('Payment plan is Build In Private');
    }

    return await this.createOrUpdateBuildInPublicSettings(org, settings);
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
    await this.bipSettingsRepository.save(bipSettings);
  }

  async createOrUpdateBuildInPublicSettings(
    org: Org,
    settings: BipSettingsDto,
  ) {
    let bipSettings = await this.bipSettingsRepository.findOneBy({
      org: { id: org.id },
    });

    if (!bipSettings) {
      bipSettings = new BipSettings();
    }
    bipSettings.org = Promise.resolve(org);
    bipSettings.isBuildInPublicEnabled = settings.isBuildInPublicEnabled;
    bipSettings.isObjectivesPagePublic = settings.isObjectivesPagePublic;
    bipSettings.isRoadmapPagePublic = settings.isRoadmapPagePublic;
    bipSettings.isIterationsPagePublic = settings.isIterationsPagePublic;
    bipSettings.isActiveIterationsPagePublic =
      settings.isActiveIterationsPagePublic;
    bipSettings.isFeedPagePublic = settings.isFeedPagePublic;
    bipSettings.isIssuesPagePublic = settings.isIssuesPagePublic;
    bipSettings.isFeatureRequestsPagePublic =
      settings.isFeatureRequestsPagePublic;
    const updatedSettings = await this.bipSettingsRepository.save(bipSettings);
    return BipSettingsMapper.toDto(updatedSettings);
  }
}
