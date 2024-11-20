import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PublicWorkItemMapper } from './public.mappers';
import { Project } from '../../../projects/project.entity';
import { WorkItem } from '../work-item.entity';

@Injectable()
export class PublicService {
  constructor(
    @InjectRepository(WorkItem)
    private workItemsRepository: Repository<WorkItem>,
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
  ) {}

  async getWorkItem(orgId: string, projectId: string, workItemId: string) {
    const project = await this.projectsRepository.findOneByOrFail({
      id: projectId,
      org: { id: orgId },
    });

    const bipSettings = await project.bipSettings;
    if (!bipSettings?.isBuildInPublicEnabled) {
      throw new NotFoundException();
    }
    const workItem = await this.workItemsRepository.findOneByOrFail({
      id: workItemId,
      org: { id: orgId },
      project: { id: projectId },
    });
    return PublicWorkItemMapper.toDto(workItem);
  }
}
