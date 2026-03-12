import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Org } from '../../../orgs/org.entity';
import { Repository } from 'typeorm';
import { Initiative } from '../initiative.entity';
import { FeatureMapper } from './public.mappers';
import { Project } from '../../../projects/project.entity';

@Injectable()
export class PublicService {
  constructor(
    @InjectRepository(Org) private orgRepository: Repository<Org>,
    @InjectRepository(Initiative)
    private initiativesRepository: Repository<Initiative>,
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
  ) {}

  async getInitiative(orgId: string, projectId: string, initiativeId: string) {
    const project = await this.projectsRepository.findOneByOrFail({
      id: projectId,
      org: { id: orgId },
    });

    const bipSettings = await project.bipSettings;

    if (
      !bipSettings?.isBuildInPublicEnabled ||
      !bipSettings?.isRoadmapPagePublic
    ) {
      throw new NotFoundException();
    }
    const initiative = await this.initiativesRepository.findOneByOrFail({
      org: { id: orgId },
      project: { id: projectId },
      id: initiativeId,
    });
    return await FeatureMapper.toDto(initiative);
  }
}
