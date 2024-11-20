import { User } from '../users/user.entity';
import { MemberDto, OrgDto, ProjectDto } from './orgs.dtos';
import { Org } from './org.entity';
import { Project } from '../projects/project.entity';

export class MembersMapper {
  static toMembers(members: User[]): MemberDto[] {
    return members.map(MembersMapper.toMember);
  }

  static toMember(member: User): MemberDto {
    return {
      id: member.id,
      name: member.name,
      email: member.email,
      isActive: member.isActive,
      createdAt: member.createdAt,
    };
  }
}

export class ProjectMapper {
  static toProject(project: Project): ProjectDto {
    return {
      id: project.id,
      name: project.name,
    };
  }
}

export class OrgsMapper {
  static async toOrg(org: Org): Promise<OrgDto> {
    const projects = await org.projects;
    return {
      id: org.id,
      name: org.name,
      invitationToken: org.invitationToken,
      paymentPlan: org.paymentPlan,
      isSubscribed: org.isSubscribed,
      nextPaymentDate: org.nextPaymentDate,
      createdAt: org.createdAt,
      updatedAt: org.updatedAt,
      projects: projects.map(ProjectMapper.toProject),
      members: MembersMapper.toMembers(await org.users),
    };
  }
}
