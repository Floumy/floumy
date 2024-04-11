import { Injectable } from '@nestjs/common';
import { BipSettingsDto } from './bip.dtos';
import { Repository } from 'typeorm';
import { BipSettings } from './bip-settings.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { BipSettingsMapper } from './bip.dtos.mapper';
import { Org } from '../orgs/org.entity';

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
    let bipSettings = await org.bipSettings;
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
    const updatedSettings = await this.bipSettingsRepository.save(bipSettings);
    return BipSettingsMapper.toDto(updatedSettings);
  }

  async getSettings(id: string) {
    const bipSettings = await this.bipSettingsRepository.findOneByOrFail({
      org: { id },
    });
    return BipSettingsMapper.toDto(bipSettings);
  }
}
