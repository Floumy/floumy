import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectDto } from './dtos';
import { Project } from '../project.entity';
import { ProjectMapper } from './public.mappers';

@Injectable()
export class PublicService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
  ) {}

  async getProject(orgId: string, projectId: string): Promise<ProjectDto> {
    const project = await this.projectsRepository.findOneByOrFail({
      org: { id: orgId },
      id: projectId,
    });
    const bipSettings = await project.bipSettings;
    if (!bipSettings?.isBuildInPublicEnabled) {
      throw new Error('The project is not public');
    }

    return await ProjectMapper.toDto(project);
  }
}
