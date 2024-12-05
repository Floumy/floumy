import { Injectable } from '@nestjs/common';
import { Timeline } from '../../common/timeline.enum';
import { IterationsService } from '../iterations.service';
import { IterationMapper } from './public.mapper';
import { InjectRepository } from '@nestjs/typeorm';
import { Org } from '../../orgs/org.entity';
import { Repository } from 'typeorm';
import { Project } from '../../projects/project.entity';

@Injectable()
export class PublicService {
  constructor(
    @InjectRepository(Org) private orgsRepository: Repository<Org>,
    private iterationsService: IterationsService,
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
  ) {}

  async listIterationsForTimeline(
    orgId: string,
    projectId: string,
    timeline: Timeline,
  ) {
    await this.validateProjectHasBuildInPublicEnabled(orgId, projectId);

    const iterations = await this.iterationsService.findIterationsForTimeline(
      orgId,
      projectId,
      timeline,
    );

    return await Promise.all(
      iterations.map((iteration) => IterationMapper.toDto(iteration)),
    );
  }

  async getIterationById(
    orgId: string,
    projectId: string,
    iterationId: string,
  ) {
    await this.validateProjectHasBuildInPublicEnabled(orgId, projectId);

    const iteration = await this.iterationsService.findIteration(
      orgId,
      projectId,
      iterationId,
    );
    return IterationMapper.toDto(iteration);
  }

  async getActiveIteration(orgId: string, projectId: string) {
    const project = await this.projectsRepository.findOneByOrFail({
      id: projectId,
      org: { id: orgId },
    });

    const bipSettings = await project.bipSettings;
    if (
      !bipSettings ||
      bipSettings.isBuildInPublicEnabled === false ||
      bipSettings.isActiveIterationsPagePublic === false
    ) {
      throw new Error('Building in public is not enabled');
    }

    const iteration = await this.iterationsService.findActiveIteration(
      orgId,
      projectId,
    );
    return iteration ? await IterationMapper.toDto(iteration) : null;
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
