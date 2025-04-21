import { Project } from './project.entity';
import { ProjectDto } from './dtos';

export class ProjectMapper {
  static async toDto(project: Project): Promise<ProjectDto> {
    return {
      id: project.id,
      name: project.name,
      description: project.description,
    };
  }
}
