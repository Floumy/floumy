import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BipSettings } from '../bip-settings.entity';
import { Repository } from 'typeorm';
import { PublicMapper } from './public.mapper';

@Injectable()
export class PublicService {
  constructor(
    @InjectRepository(BipSettings)
    private bipSettingsRepository: Repository<BipSettings>,
  ) {}

  async getPublicSettings(orgId: string, productId: string) {
    const settings = await this.bipSettingsRepository.findOne({
      where: { org: { id: orgId }, product: { id: productId } },
    });

    return PublicMapper.toPublicSettingsDto(settings);
  }
}
