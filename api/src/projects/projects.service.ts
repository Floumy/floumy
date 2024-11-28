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
    });
    return await Promise.all(projects.map(ProjectMapper.toDto));
  }

  async createProject(
    userId: string,
    orgId: string,
    createProjectDto: { name: string },
  ) {
    if (!userId) throw new Error('User id is required');
    if (!orgId) throw new Error('Org id is required');
    if (!createProjectDto.name) throw new Error('Project name is required');

    const org = await this.orgsRepository.findOneByOrFail({
      id: orgId,
    });

    const user = await this.usersRepository.findOneByOrFail({
      id: userId,
      org: { id: orgId },
    });

    const project = new Project();
    project.name = createProjectDto.name;
    project.org = Promise.resolve(org);
    await this.projectsRepository.save(project);
    const userProjects = await user.projects;
    userProjects.push(project);
    user.projects = Promise.resolve(userProjects);
    await this.usersRepository.save(user);
    this.eventEmitter.emit('project.created', project);
    return await ProjectMapper.toDto(project);
  }
}
