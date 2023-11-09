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
    const payload = { sub: user.id, name: user.name, email };
    const refreshToken = await this.getOrCreateRefreshToken(user);
    return {
      accessToken: await this.tokensService.generateAccessToken(payload),
      refreshToken
    };
  }

  private async getOrCreateRefreshToken(user: User) {
    const refreshToken = await user.refreshToken;

    const payload = { sub: user.id, name: user.name, email: user.email };
    if (!refreshToken) {
      return await this.createRefreshToken(payload, user);
    }

    if (refreshToken.expirationDate.getTime() < Date.now()) {
      return await this.updateRefreshToken(payload, refreshToken);
    }

    return refreshToken.token;
  }

  private async updateRefreshToken(payload: object | Buffer, refreshToken: RefreshToken) {
    const token = await this.tokensService.generateRefreshToken(payload);
    refreshToken.token = token;
    refreshToken.expirationDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await this.refreshTokenRepository.save(refreshToken);
    return token;
  }

  private async createRefreshToken(payload: object | Buffer, user: User) {
    const token = await this.tokensService.generateRefreshToken(payload);
    user.refreshToken = Promise.resolve(new RefreshToken(token));
    await this.usersService.update(user);
    return token;
  }

  async signUp(name: string, email: string, password: string) {
    const user = await this.usersService.create(name, email, password);
    const payload = { sub: user.id, name, email };
    const accessToken = await this.tokensService.generateAccessToken(payload);
    const refreshToken = await this.createRefreshToken(payload, user);
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
    const payload = { sub: user.id, name: user.name, email: user.email };
    return {
      accessToken: await this.tokensService.generateAccessToken(payload),
      refreshToken: await this.updateRefreshToken(payload, refreshTokenEntity)
    };
  }
}
