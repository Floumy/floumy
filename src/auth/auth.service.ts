import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';
import { RefreshToken } from './refresh-token.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TokensService } from './tokens.service';
import { SignUpDto } from './auth.dtos';
import { v4 as uuid } from 'uuid';
import { NotificationsService } from '../notifications/notifications.service';

export type AuthDto = {
  accessToken: string;
  refreshToken: string;
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    private tokensService: TokensService,
    private notificationsService: NotificationsService,
  ) {}

  async signIn(email: string, password: string): Promise<AuthDto> {
    const user = await this.usersService.findOneByEmail(email);
    if (!user?.isActive) {
      this.logger.error('User is not active');
      throw new UnauthorizedException();
    }
    if (
      !(await this.usersService.isPasswordCorrect(password, user?.password))
    ) {
      this.logger.error('Invalid credentials');
      throw new UnauthorizedException();
    }
    const refreshToken = await this.getOrCreateRefreshToken(user);
    return {
      accessToken: await this.tokensService.generateAccessToken(user),
      refreshToken,
    };
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

  async signUp(signUpDto: SignUpDto): Promise<void> {
    const user = await this.usersService.create(
      signUpDto.name,
      signUpDto.email,
      signUpDto.password,
      signUpDto.invitationToken,
    );

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
      throw new Error('Failed to send activation email');
    }
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

  private async generateActivationToken() {
    return uuid();
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
}
