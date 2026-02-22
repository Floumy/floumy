import { Injectable } from '@nestjs/common';
import { Timeline } from '../../common/timeline.enum';
import { CyclesService } from '../cycles.service';
import { CycleMapper } from './public.mapper';
import { InjectRepository } from '@nestjs/typeorm';
import { Org } from '../../orgs/org.entity';
import { Repository } from 'typeorm';
import { Project } from '../../projects/project.entity';

@Injectable()
export class PublicService {
  constructor(
    @InjectRepository(Org) private orgsRepository: Repository<Org>,
    private cyclesService: CyclesService,
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
  ) {}

  async listCyclesForTimeline(
    orgId: string,
    projectId: string,
    timeline: Timeline,
  ) {
    await this.validateProjectHasBuildInPublicEnabled(orgId, projectId);

    const cycles = await this.cyclesService.findCyclesForTimeline(
      orgId,
      projectId,
      timeline,
    );

    return await Promise.all(
      cycles.map((cycle) => CycleMapper.toDto(cycle)),
    );
  }

  async getCycleById(orgId: string, projectId: string, cycleId: string) {
    await this.validateProjectHasBuildInPublicEnabled(orgId, projectId);

    const cycle = await this.cyclesService.findCycle(
      orgId,
      projectId,
      cycleId,
    );
    return CycleMapper.toDto(cycle);
  }

  async getActiveCycle(orgId: string, projectId: string) {
    const project = await this.projectsRepository.findOneByOrFail({
      id: projectId,
      org: { id: orgId },
    });

    const bipSettings = await project.bipSettings;
    if (
      !bipSettings ||
      bipSettings.isBuildInPublicEnabled === false ||
      bipSettings.isActiveCyclesPagePublic === false
    ) {
      throw new Error('Building in public is not enabled');
    }

    const cycle = await this.cyclesService.findActiveCycle(orgId, projectId);
    return cycle ? await CycleMapper.toDto(cycle) : null;
  }

  private async validateProjectHasBuildInPublicEnabled(
    orgId: string,
    projectId: string,
  ) {
    const project = await this.projectsRepository.findOneByOrFail({
      id: projectId,
      org: { id: orgId },
    });

    const bipSettings = await project.bipSettings;

    if (!bipSettings || bipSettings.isBuildInPublicEnabled === false) {
      throw new Error('Building in public is not enabled');
    }
  }
}
