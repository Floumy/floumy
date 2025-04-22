import { Project } from './project.entity';
import { ProjectDto } from './dtos';

export class ProjectMapper {
  static async toDto(project: Project): Promise<ProjectDto> {
    const bipSettings = await project.bipSettings;

    return {
      id: project.id,
      name: project.name,
      description: project.description,
      isBuildInPublicEnabled: bipSettings?.isBuildInPublicEnabled,
      gitlabProjectUrl: project.gitlabProjectUrl,
      githubRepositoryUrl: project.githubRepositoryUrl,
      createdAt: project.createdAt,
      updateAt: project.updatedAt,
    };
  }
}
