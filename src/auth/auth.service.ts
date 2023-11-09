import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { User } from "../users/user.entity";
import { RefreshToken } from "./refresh-token.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { TokensService } from "./tokens.service";

export type AuthDto = {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService,
              @InjectRepository(RefreshToken)
              private refreshTokenRepository: Repository<RefreshToken>,
              private tokensService: TokensService) {
  }

  async signIn(email: string, password: string): Promise<AuthDto> {
    const user = await this.usersService.findOneByEmail(email);
    if (!await this.usersService.isPasswordCorrect(password, user?.password)) {
      throw new UnauthorizedException();
    }
    const refreshToken = await this.getOrCreateRefreshToken(user);
    return {
      accessToken: await this.tokensService.generateAccessToken(user),
      refreshToken
    };
  }

  private async getOrCreateRefreshToken(user: User) {
    const refreshToken = await user.refreshToken;

    if (!refreshToken) {
      return await this.createRefreshToken(user);
    }

    if (refreshToken.expirationDate.getTime() < Date.now()) {
      return await this.updateRefreshToken(user, refreshToken);
    }

    return refreshToken.token;
  }

  private async updateRefreshToken(user: User, refreshToken: RefreshToken) {
    const token = await this.tokensService.generateRefreshToken(user);
    refreshToken.token = token;
    refreshToken.expirationDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await this.refreshTokenRepository.save(refreshToken);
    return token;
  }

  private async createRefreshToken(user: User) {
    const token = await this.tokensService.generateRefreshToken(user);
    user.refreshToken = Promise.resolve(new RefreshToken(token));
    await this.usersService.update(user);
    return token;
  }

  async signUp(name: string, email: string, password: string) {
    const user = await this.usersService.create(name, email, password);
    const accessToken = await this.tokensService.generateAccessToken(user);
    const refreshToken = await this.createRefreshToken(user);
    return {
      accessToken: accessToken,
      refreshToken: refreshToken
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      await this.tokensService.verifyRefreshToken(refreshToken);
    } catch (e) {
      throw new UnauthorizedException();
    }

    const refreshTokenEntity = await this.refreshTokenRepository.findOneBy({ token: refreshToken });

    if (!refreshTokenEntity) {
      throw new UnauthorizedException();
    }

    if (refreshTokenEntity.expirationDate.getTime() < Date.now()) {
      throw new UnauthorizedException();
    }

    const user = await refreshTokenEntity.user;
    return {
      accessToken: await this.tokensService.generateAccessToken(user),
      refreshToken: await this.updateRefreshToken(user, refreshTokenEntity)
    };
  }
}
