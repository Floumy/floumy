import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Org } from '../org.entity';
import { Repository } from 'typeorm';
import { PublicMapper } from './public.mapper';

@Injectable()
export class PublicService {
  constructor(@InjectRepository(Org) private orgRepository: Repository<Org>) {}

  async getPublicOrg(id: string) {
    const org = await this.orgRepository.findOneByOrFail({ id });
    const bipSettings = await org.bipSettings;
    if (bipSettings?.isBuildInPublicEnabled !== true) {
      throw new Error('Org is not public');
    }
    return PublicMapper.toPublicOrg(org);
  }
}
