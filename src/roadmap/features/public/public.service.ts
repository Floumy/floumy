import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Org } from '../../../orgs/org.entity';
import { Repository } from 'typeorm';
import { Feature } from '../feature.entity';
import { FeatureMapper } from './public.mappers';

@Injectable()
export class PublicService {
  constructor(
    @InjectRepository(Org) private orgRepository: Repository<Org>,
    @InjectRepository(Feature) private featuresRepository: Repository<Feature>,
  ) {}

  async getFeature(orgId: string, featureId: string) {
    const org = await this.orgRepository.findOneByOrFail({ id: orgId });
    const bipSettings = await org.bipSettings;
    if (!bipSettings?.isBuildInPublicEnabled) {
      throw new Error('Roadmap page is not public');
    }
    const feature = await this.featuresRepository.findOneByOrFail({
      org: { id: orgId },
      id: featureId,
    });
    return await FeatureMapper.toDto(feature);
  }
}
