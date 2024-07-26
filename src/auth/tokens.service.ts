import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/user.entity';

@Injectable()
export class TokensService {
  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  async generateAccessToken(user: User) {
    const org = await user.org;
    return await this.jwtService.signAsync(
      {
        sub: user.id,
        name: user.name,
        email: user.email,
        org: org ? org.id : null,
      },
      {
        expiresIn: this.configService.get('jwt.accessToken.expiresIn'),
        secret: this.configService.get('jwt.accessToken.secret'),
      },
    );
  }

  async generateRefreshToken(user: User) {
    return await this.jwtService.signAsync(
      {
        sub: user.id,
        name: user.name,
        email: user.email,
        org: (await user.org)?.id,
      },
      {
        expiresIn: this.configService.get('jwt.refreshToken.expiresIn'),
        secret: this.configService.get('jwt.refreshToken.secret'),
      },
    );
  }

  async verifyAccessToken(accessToken: string) {
    return await this.jwtService.verifyAsync(accessToken, {
      secret: this.configService.get('jwt.accessToken.secret'),
    });
  }

  async verifyRefreshToken(refreshToken: string) {
    return await this.jwtService.verifyAsync(refreshToken, {
      secret: this.configService.get('jwt.refreshToken.secret'),
    });
  }
}
