import { Injectable } from '@nestjs/common';
import { Timeline } from '../../common/timeline.enum';
import { IterationsService } from '../iterations.service';
import { IterationMapper } from './public.mapper';
import { InjectRepository } from '@nestjs/typeorm';
import { Org } from '../../orgs/org.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PublicService {
  constructor(
    @InjectRepository(Org) private orgsRepository: Repository<Org>,
    private iterationsService: IterationsService,
  ) {}

  async listIterationsForTimeline(orgId: string, timeline: Timeline) {
    const org = await this.orgsRepository.findOneByOrFail({ id: orgId });
    const bipSettings = await org.bipSettings;

    if (!bipSettings || bipSettings.isBuildInPublicEnabled === false) {
      throw new Error('Building in public is not enabled');
    }

    const iterations = await this.iterationsService.findIterationsForTimeline(
      orgId,
      timeline,
    );
    return await Promise.all(
      iterations.map((iteration) => IterationMapper.toDto(iteration)),
    );
  }
}
