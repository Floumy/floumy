import { User } from "../users/user.entity";
import { MemberDto } from "./orgs.dtos";

export class MembersMapper {
  static toMembers(members: User[]): MemberDto[] {
    return members.map(MembersMapper.toMember);
  }

  static toMember(member: User): MemberDto {
    return {
      id: member.id,
      name: member.name,
      email: member.email,
      createdAt: member.createdAt
    };
  }
}
