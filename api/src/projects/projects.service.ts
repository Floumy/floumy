import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from './project.entity';
import { Repository } from 'typeorm';
import { ProjectMapper } from './mappers';
import { Org } from '../orgs/org.entity';
import { User } from '../users/user.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectsRepository: Repository<Project>,
    @InjectRepository(Org) private readonly orgsRepository: Repository<Org>,
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async listProjects(orgId: string) {
    const projects = await this.projectsRepository.find({
      where: { org: { id: orgId } },
      order: { createdAt: 'DESC' },
      relations: ['bipSettings'],
    });
    return await Promise.all(projects.map(ProjectMapper.toDto));
  }

  async createProject(
    userId: string,
    orgId: string,
    createProjectDto: { name: string; description?: string },
  ) {
    await this.validateProjectName(orgId, createProjectDto.name);

    const org = await this.orgsRepository.findOneByOrFail({
      id: orgId,
    });

    const user = await this.usersRepository.findOneByOrFail({
      id: userId,
      org: { id: orgId },
    });

    const project = new Project();
    project.name = createProjectDto.name;
    project.description = createProjectDto.description;
    project.org = Promise.resolve(org);
    await this.projectsRepository.save(project);
    const userProjects = await user.projects;
    userProjects.push(project);
    user.projects = Promise.resolve(userProjects);
    await this.usersRepository.save(user);
    this.eventEmitter.emit('project.created', project);
    return await ProjectMapper.toDto(project);
  }

  async findOneById(orgId: string, projectId: string) {
    const project = await this.projectsRepository.findOneByOrFail({
      id: projectId,
      org: { id: orgId },
    });
    return await ProjectMapper.toDto(project);
  }

  async updateProject(
    orgId: string,
    projectId: string,
    updateProjectDto: { name: string; description?: string },
  ) {
    const project = await this.projectsRepository.findOneByOrFail({
      id: projectId,
      org: { id: orgId },
    });

    if (project.name !== updateProjectDto.name) {
      await this.validateProjectName(orgId, updateProjectDto.name);
    }

    project.name = updateProjectDto.name;
    project.description = updateProjectDto?.description;
    await this.projectsRepository.save(project);
    return await ProjectMapper.toDto(project);
  }

  async deleteProject(orgId: string, projectId: string) {
    await this.validateMoreThanOneProject(orgId);
    const project = await this.projectsRepository.findOneByOrFail({
      id: projectId,
      org: { id: orgId },
    });
    await this.projectsRepository.remove(project);
  }

  private async validateProjectName(orgId: string, name: string) {
    if (!name) throw new Error('Project name is required');
    if (name.trim().length === 0)
      throw new Error('Project name cannot be empty');
    if (name.length > 50)
      throw new Error('Project name cannot be longer than 50 characters');
    if (name.length < 3)
      throw new Error('Project name must be at least 3 characters');
    if (!/^[a-zA-Z0-9_\- ]+$/.test(name))
      throw new Error(
        'Project name can only contain letters, numbers, underscores, hyphens and spaces',
      );

    // Check if the project name already exists
    const projects = await this.projectsRepository.find({
      where: { org: { id: orgId }, name: name },
      relations: ['users'],
    });

    if (projects.length > 0) throw new Error('Project name already exists');
  }

  private async validateMoreThanOneProject(orgId: string) {
    const projects = await this.projectsRepository.find({
      where: { org: { id: orgId } },
    });

    if (projects.length > 1) return;

    throw new Error('You cannot delete the last project');
  }
}
