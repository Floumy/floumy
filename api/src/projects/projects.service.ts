import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from './project.entity';
import { Repository } from 'typeorm';
import { ProjectMapper } from './mappers';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectsRepository: Repository<Project>,
  ) {}

  async listProjects(orgId: string) {
    const projects = await this.projectsRepository.find({
      where: { org: { id: orgId } },
      order: { createdAt: 'DESC' },
    });
    return await Promise.all(projects.map(ProjectMapper.toDto));
  }
}
