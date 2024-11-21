import { Org } from '../org.entity';
import { PublicOrgDto } from './dtos';
import { Project } from '../../projects/project.entity';

class ProjectMapper {
  static toProject(project: Project): { id: string; name: string } {
    return {
      id: project.id,
      name: project.name,
    };
  }
}

export class PublicMapper {
  public static async toPublicOrg(org: Org): Promise<PublicOrgDto> {
    const projects = await org.projects;
    return {
      id: org.id,
      name: org.name,
      paymentPlan: org.paymentPlan,
      projects: projects.map(ProjectMapper.toProject),
      createdAt: org.createdAt,
      updatedAt: org.updatedAt,
    };
  }
}
