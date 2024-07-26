import { User } from './user.entity';

export class UserMapper {
  static async toDto(user: User) {
    const org = await user.org;
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      orgId: org ? org.id : null,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
