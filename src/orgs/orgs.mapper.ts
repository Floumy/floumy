import { User } from "../users/user.entity";
import { MemberDto, OrgDto } from "./orgs.dtos";
import { Org } from "./org.entity";

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
      createdAt: member.createdAt
    };
  }
}

export class OrgsMapper {
  static async toOrg(org: Org): Promise<OrgDto> {
    return {
      id: org.id,
      invitationToken: org.invitationToken,
      createdAt: org.createdAt,
      updatedAt: org.updatedAt,
      members: MembersMapper.toMembers(await org.users)
    };
  }
}
