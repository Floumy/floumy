import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Timeline } from '../../../common/timeline.enum';
import { MilestonesService } from '../milestones.service';
import { PublicMilestoneMapper } from './public.mappers';
import { Project } from '../../../projects/project.entity';

@Injectable()
export class PublicService {
  constructor(
    private milestoneService: MilestonesService,
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
  ) {}

  async listMilestones(orgId: string, projectId: string, timeline: Timeline) {
    await this.validateBuildInPublicSettings(orgId, projectId);
    return this.milestoneService.listForTimeline(orgId, projectId, timeline);
  }

  async findMilestone(orgId: string, projectId: string, milestoneId: string) {
    await this.validateBuildInPublicSettings(orgId, projectId);
    const milestone = await this.milestoneService.findOneById(
      orgId,
      projectId,
      milestoneId,
    );
    return await PublicMilestoneMapper.toDto(milestone);
  }

  private async validateBuildInPublicSettings(
    orgId: string,
    projectId: string,
  ) {
    const project = await this.projectsRepository.findOneByOrFail({
      id: projectId,
      org: { id: orgId },
    });
    const bipSettings = await project.bipSettings;
    if (
      !bipSettings?.isRoadmapPagePublic ||
      !bipSettings?.isBuildInPublicEnabled
    ) {
      throw new Error('Roadmap page is not public');
    }
  }
}
