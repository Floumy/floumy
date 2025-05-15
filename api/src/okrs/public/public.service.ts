import { Injectable } from '@nestjs/common';
import { Timeline } from '../../common/timeline.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OkrsService } from '../okrs.service';
import { PublicOkrMapper } from './public.mappers';
import { Project } from '../../projects/project.entity';

@Injectable()
export class PublicService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
    private okrsService: OkrsService,
  ) {}

  async listObjectives(orgId: string, projectId: string, timeline: Timeline) {
    await this.validateProjectHasBuildingInPublicEnabled(orgId, projectId);

    const objectives = await this.okrsService.listObjectivesForTimeline(
      orgId,
      projectId,
      timeline,
    );

    return objectives.map(PublicOkrMapper.toDTO);
  }

  async getObjective(orgId: string, projectId: string, okrId: string) {
    await this.validateProjectHasBuildingInPublicEnabled(orgId, projectId);

    const { objective, keyResults } =
      await this.okrsService.getObjectiveDetails(okrId, orgId, projectId);

    return await PublicOkrMapper.toDetailDto(objective, keyResults);
  }

  async getKeyResult(
    orgId: string,
    projectId: string,
    objectiveId: string,
    keyResultId: string,
  ) {
    await this.validateProjectHasBuildingInPublicEnabled(orgId, projectId);

    const keyResult = await this.okrsService.getKeyResult(
      orgId,
      objectiveId,
      keyResultId,
    );

    return PublicOkrMapper.toKeyResultDto(keyResult);
  }

  private async validateProjectHasBuildingInPublicEnabled(
    orgId: string,
    projectId: string,
  ) {
    const project = await this.projectsRepository.findOneByOrFail({
      id: projectId,
      org: { id: orgId },
    });

    const bipSettings = await project.bipSettings;
    if (!bipSettings?.isBuildInPublicEnabled) {
      throw new Error('Building in public is not enabled');
    }
  }
}
