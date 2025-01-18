import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';
import { RefreshToken } from './refresh-token.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TokensService } from './tokens.service';
import { OrgSignUpDto } from './auth.dtos';
import { v4 as uuid } from 'uuid';
import { MailNotificationsService } from '../mail-notifications/mail-notifications.service';
import { OrgsService } from '../orgs/orgs.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Org } from '../orgs/org.entity';

export type AuthDto = {
  accessToken: string;
  refreshToken: string;
  lastSignedIn: Date;
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    private tokensService: TokensService,
    private notificationsService: MailNotificationsService,
    private orgsService: OrgsService,
    private eventEmitter: EventEmitter2,
  ) {}

  async signIn(email: string, password: string): Promise<AuthDto> {
    const user = await this.usersService.findOneByEmail(email);
    if (!user?.isActive) {
      this.logger.error('The user is not active');
      throw new UnauthorizedException('Your account is not yet active.');
    }
    if (
      !(await this.usersService.isPasswordCorrect(password, user?.password))
    ) {
      this.logger.error('Invalid credentials');
      throw new UnauthorizedException(
        'Invalid credentials. Please check your email and password.',
      );
    }
    const refreshToken = await this.getOrCreateRefreshToken(user);
    const authData = {
      accessToken: await this.tokensService.generateAccessToken(user),
      refreshToken,
      lastSignedIn: user.lastSignedIn,
    };
    await this.updateLastSignedIn(user);
    return authData;
  }

  async orgSignUp(signUpDto: OrgSignUpDto): Promise<void> {
    const org = await this.orgsService.getOrCreateOrg(
      signUpDto.projectName,
      signUpDto.invitationToken,
    );

    if (!org) {
      this.logger.error(
        'The organization for the invitation token was not found',
      );
      throw new Error(
        'The organization for the invitation token was not found',
      );
    }

    await this.createUserAndSendActivationEmail(
      signUpDto.name,
      signUpDto.email,
      signUpDto.password,
      org,
    );
  }

  async signUp(signUpDto: OrgSignUpDto): Promise<void> {
    await this.createUserAndSendActivationEmail(
      signUpDto.name,
      signUpDto.email,
      signUpDto.password,
    );
  }

  async refreshToken(refreshToken: string) {
    try {
      await this.tokensService.verifyRefreshToken(refreshToken);
    } catch (e) {
      this.logger.error(e.message);
      throw new UnauthorizedException();
    }

    const refreshTokenEntity = await this.refreshTokenRepository.findOneBy({
      token: refreshToken,
    });

    if (!refreshTokenEntity) {
      this.logger.error('Refresh token not found');
      throw new UnauthorizedException();
    }

    if (refreshTokenEntity.expirationDate.getTime() < Date.now()) {
      this.logger.error('Refresh token expired');
      throw new UnauthorizedException();
    }

    const user = await refreshTokenEntity.user;

    if (!user.isActive) {
      this.logger.error('User is not active');
      throw new UnauthorizedException();
    }

    return {
      accessToken: await this.tokensService.generateAccessToken(user),
      refreshToken: await this.createRefreshToken(user),
    };
  }

  async activateAccount(activationToken: string) {
    if (!activationToken) {
      this.logger.error('Activation token not provided');
      throw new Error('Activation token not provided');
    }

    const user =
      await this.usersService.findOneByActivationToken(activationToken);

    if (!user) {
      this.logger.error('User not found');
      throw new Error('Activation token not found');
    }

    user.isActive = true;
    user.activationToken = null;
    await this.usersService.save(user);

    this.eventEmitter.emit('user.activated', user);
  }

  async requestPasswordReset(email: string) {
    const user = await this.usersService.findOneByEmail(email);

    if (!user) {
      this.logger.error('User not found');
      return;
    }

    user.passwordResetToken = uuid();
    await this.usersService.save(user);
    await this.notificationsService.sendPasswordResetEmail(
      user.name,
      user.email,
      user.passwordResetToken,
    );
  }

  async resetPassword(newPassword: string, resetToken: string) {
    const user =
      await this.usersService.findOneByPasswordResetToken(resetToken);

    if (!user) {
      this.logger.error('User not found');
      throw new Error('Password reset token not found');
    }

    user.password = await this.usersService.encryptPassword(newPassword);
    user.passwordResetToken = null;
    await this.usersService.save(user);
  }

  private async createUserAndSendActivationEmail(
    name: string,
    email: string,
    password: string,
    org?: Org,
  ) {
    const user = await this.usersService.createUser(name, email, password, org);

    try {
      const activationToken = await this.generateActivationToken();
      await this.notificationsService.sendActivationEmail(
        user.name,
        user.email,
        activationToken,
      );
      user.activationToken = activationToken;
      await this.usersService.save(user);
    } catch (e) {
      this.logger.error(e.message);
      throw new Error('The activation email could not be sent');
    }
  }

  private async getOrCreateRefreshToken(user: User) {
    const refreshToken = await this.refreshTokenRepository.findOne({
      where: { user: { id: user.id } },
      order: { createdAt: 'DESC' },
    });

    if (!refreshToken || refreshToken.expirationDate.getTime() < Date.now()) {
      return await this.createRefreshToken(user);
    }

    return refreshToken.token;
  }

  private async createRefreshToken(user: User) {
    const token = await this.tokensService.generateRefreshToken(user);
    const refreshToken = new RefreshToken(token);
    refreshToken.user = Promise.resolve(user);
    await this.refreshTokenRepository.save(refreshToken);
    return token;
  }

  private async generateActivationToken() {
    return uuid();
  }

  private async updateLastSignedIn(user: User) {
    user.lastSignedIn = new Date();
    await this.usersService.save(user);
  }
}
