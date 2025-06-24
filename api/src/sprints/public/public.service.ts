import { Injectable } from '@nestjs/common';
import { Timeline } from '../../common/timeline.enum';
import { SprintsService } from '../sprints.service';
import { SprintMapper } from './public.mapper';
import { InjectRepository } from '@nestjs/typeorm';
import { Org } from '../../orgs/org.entity';
import { Repository } from 'typeorm';
import { Project } from '../../projects/project.entity';

@Injectable()
export class PublicService {
  constructor(
    @InjectRepository(Org) private orgsRepository: Repository<Org>,
    private sprintsService: SprintsService,
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
  ) {}

  async listSprintsForTimeline(
    orgId: string,
    projectId: string,
    timeline: Timeline,
  ) {
    await this.validateProjectHasBuildInPublicEnabled(orgId, projectId);

    const sprints = await this.sprintsService.findSprintsForTimeline(
      orgId,
      projectId,
      timeline,
    );

    return await Promise.all(
      sprints.map((sprint) => SprintMapper.toDto(sprint)),
    );
  }

  async getSprintById(orgId: string, projectId: string, sprintId: string) {
    await this.validateProjectHasBuildInPublicEnabled(orgId, projectId);

    const sprint = await this.sprintsService.findSprint(
      orgId,
      projectId,
      sprintId,
    );
    return SprintMapper.toDto(sprint);
  }

  async getActiveSprint(orgId: string, projectId: string) {
    const project = await this.projectsRepository.findOneByOrFail({
      id: projectId,
      org: { id: orgId },
    });

    const bipSettings = await project.bipSettings;
    if (
      !bipSettings ||
      bipSettings.isBuildInPublicEnabled === false ||
      bipSettings.isActiveSprintsPagePublic === false
    ) {
      throw new Error('Building in public is not enabled');
    }

    const sprint = await this.sprintsService.findActiveSprint(orgId, projectId);
    return sprint ? await SprintMapper.toDto(sprint) : null;
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
