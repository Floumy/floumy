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
    await this.validateOrgHasBuildInPublicEnabled(orgId);

    const iterations = await this.iterationsService.findIterationsForTimeline(
      orgId,
      timeline,
    );

    return await Promise.all(
      iterations.map((iteration) => IterationMapper.toDto(iteration)),
    );
  }

  private async validateOrgHasBuildInPublicEnabled(orgId: string) {
    const org = await this.orgsRepository.findOneByOrFail({ id: orgId });
    const bipSettings = await org.bipSettings;

    if (!bipSettings || bipSettings.isBuildInPublicEnabled === false) {
      throw new Error('Building in public is not enabled');
    }
  }

  async getIterationById(orgId: string, iterationId: string) {
    await this.validateOrgHasBuildInPublicEnabled(orgId);

    const iteration = await this.iterationsService.findIterationByOrgIdAndId(
      orgId,
      iterationId,
    );
    return IterationMapper.toDto(iteration);
  }
}
