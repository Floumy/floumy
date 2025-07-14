import { Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { QueryRunner, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { OrgsService } from '../orgs/orgs.service';
import { UserMapper } from './user.mapper';
import { RefreshToken } from '../auth/refresh-token.entity';
import { Org } from '../orgs/org.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PatchUserDto } from './dtos';
import { UserRole } from './enums';
import { uuid } from 'uuidv4';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private refreshTokensRepository: Repository<RefreshToken>,
    private orgsService: OrgsService,
    private configService: ConfigService,
    private eventEmitter: EventEmitter2,
  ) {}

  async findOneByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findOneBy({ email });
  }

  async createUser(
    name: string,
    email: string,
    password: string,
    org: Org = null,
    queryRunner?: QueryRunner,
  ) {
    await this.validateUser(name, email, password);
    const hashedPassword = await this.encryptPassword(password);
    const user = new User(name, email, hashedPassword);

    if (org) {
      user.org = Promise.resolve(org);
      const projects = await org.projects;
      user.projects = Promise.resolve(projects);
    }

    if (!queryRunner) {
      return await this.usersRepository.save(user);
    }
    return await queryRunner.manager.save(user);
  }

  /**
   * This method is used only by tests and will be removed in the future
   * @deprecated Use createUser instead for projection code
   * @param name
   * @param email
   * @param password
   * @param invitationToken
   * @param userRole
   */
  async createUserWithOrg(
    name: string,
    email: string,
    password: string,
    invitationToken?: string,
    userRole = UserRole.ADMIN,
  ) {
    await this.validateUser(name, email, password);
    const hashedPassword = await this.encryptPassword(password);
    const user = new User(name, email, hashedPassword);
    user.role = userRole;
    if (invitationToken) {
      const org =
        await this.orgsService.findOneByInvitationToken(invitationToken);
      if (!org) throw new Error('Invalid invitation token');
      user.org = Promise.resolve(org);
    } else {
      user.org = Promise.resolve(await this.orgsService.createForUser(user));
    }
    return await this.usersRepository.save(user);
  }

  async encryptPassword(password: string) {
    return bcrypt.hash(
      password,
      +this.configService.get<number>('encryption.rounds'),
    );
  }

  async isPasswordCorrect(password: string, hash: string) {
    try {
      return await bcrypt.compare(password, hash);
    } catch (e) {
      return false;
    }
  }

  async clear() {
    await this.usersRepository.clear();
  }

  async update(user: User) {
    await this.usersRepository.save(user);
  }

  async findOne(userId: string) {
    const user = await this.usersRepository.findOneByOrFail({ id: userId });
    return UserMapper.toDto(user);
  }

  async findOneByActivationToken(activationToken: string) {
    return this.usersRepository.findOneBy({ activationToken });
  }

  async save(user: User) {
    return this.usersRepository.save(user);
  }

  async deactivate(orgId: string, userId: string) {
    const user = await this.usersRepository.findOneByOrFail({
      id: userId,
      org: { id: orgId },
    });
    await this.validateThatThereWillBeAtLeastOneActiveUser(user);
    user.isActive = false;
    await this.usersRepository.save(user);
    await this.removeRefreshTokensFor(user);

    this.eventEmitter.emit('user.deactivated', user);
  }

  async findOneByPasswordResetToken(resetToken: string) {
    return this.usersRepository.findOneByOrFail({
      passwordResetToken: resetToken,
    });
  }

  async patch(userId: string, patchCurrentUserDto: PatchUserDto) {
    const user = await this.usersRepository.findOneByOrFail({ id: userId });
    if (patchCurrentUserDto.name && patchCurrentUserDto.name.trim().length >= 2)
      user.name = patchCurrentUserDto.name;
    const savedUser = await this.usersRepository.save(user);
    return UserMapper.toDto(savedUser);
  }

  private async validateUser(name: string, email: string, password: string) {
    if (!this.isNameValid(name)) throw new Error('Invalid name');
    if (!this.isEmailValid(email)) throw new Error('Invalid email');
    if (!this.isPasswordValid(password)) throw new Error('Invalid password');
    if (await this.findOneByEmail(email))
      throw new Error('Email already exists');
  }

  private isPasswordValid(password: string) {
    return password !== '' && password.length >= 8;
  }

  private isEmailValid(email: string) {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,4}$/;
    return email !== '' && emailRegex.test(email);
  }

  private isNameValid(name: string) {
    return name !== '' && name.length >= 2;
  }

  private async validateThatThereWillBeAtLeastOneActiveUser(user: User) {
    const org = await user.org;
    const users = await org.users;
    const activeUsers = users.filter((u) => u.isActive);
    if (activeUsers.length <= 1)
      throw new Error('Cannot deactivate the only active user in the org');
  }

  private async removeRefreshTokensFor(user: User) {
    const refreshTokens = await user.refreshTokens;
    await Promise.all(
      refreshTokens.map((token) => this.refreshTokensRepository.remove(token)),
    );
  }

  async changeRole(
    adminUserId: string,
    orgId: string,
    userId: string,
    role: string,
  ) {
    if (adminUserId === userId) {
      throw new Error('Cannot change your own role');
    }

    await this.usersRepository.findOneByOrFail({
      id: adminUserId,
      org: { id: orgId },
      role: UserRole.ADMIN,
    });
    const user = await this.usersRepository.findOneByOrFail({
      id: userId,
      org: { id: orgId },
    });
    role = role.toUpperCase();
    if (role !== 'ADMIN' && role !== 'CONTRIBUTOR') {
      throw new Error('Invalid role');
    }
    user.role = UserRole[role];
    await this.usersRepository.save(user);
  }

  async refreshMcpToken(userId: string): Promise<string> {
    const token = uuid();
    await this.usersRepository.update(userId, { mcpToken: token });
    return token;
  }

  async getMcpToken(userId: string): Promise<string> {
    const user = await this.usersRepository.findOneByOrFail({ id: userId });
    if (!user.mcpToken) {
      throw new Error('MCP token not found for user');
    }
    return user.mcpToken;
  }
}
