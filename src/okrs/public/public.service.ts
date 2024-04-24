import { Injectable } from '@nestjs/common';
import { Timeline } from '../../common/timeline.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { Org } from '../../orgs/org.entity';
import { Repository } from 'typeorm';
import { OkrsService } from '../okrs.service';
import { PublicOkrMapper } from './public.mappers';

@Injectable()
export class PublicService {
  constructor(
    @InjectRepository(Org)
    private orgRepository: Repository<Org>,
    private okrsService: OkrsService,
  ) {}

  async listObjectives(orgId: string, timeline: Timeline) {
    await this.validateOrgHasBuildingInPublicEnabled(orgId);

    const objectives = await this.okrsService.listObjectivesForTimeline(
      orgId,
      timeline,
    );

    return objectives.map(PublicOkrMapper.toDTO);
  }

  private async validateOrgHasBuildingInPublicEnabled(orgId: string) {
    const org = await this.orgRepository.findOneBy({ id: orgId });
    if (!org) {
      throw new Error('Org not found');
    }

    const bipSettings = await org.bipSettings;
    if (!bipSettings?.isBuildInPublicEnabled) {
      throw new Error('Building in public is not enabled');
    }
  }

  async getObjective(orgId: string, okrId: string) {
    await this.validateOrgHasBuildingInPublicEnabled(orgId);

    const { objective, keyResults } =
      await this.okrsService.getObjectiveDetails(okrId, orgId);

    return await PublicOkrMapper.toDetailDto(objective, keyResults);
  }

  async getKeyResult(orgId: string, objectiveId: string, keyResultId: string) {
    await this.validateOrgHasBuildingInPublicEnabled(orgId);

    const keyResult = await this.okrsService.getKeyResult(
      orgId,
      objectiveId,
      keyResultId,
    );

    return PublicOkrMapper.toKeyResultDto(keyResult);
  }
}
