import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { JwtService } from "@nestjs/jwt";
import { User } from "../users/user.entity";
import { RefreshToken } from "./refresh-token.entity";

export type AuthDto = {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService,
              private jwtService: JwtService) {
  }

  async signIn(email: string, password: string): Promise<AuthDto> {
    const user = await this.usersService.findOneByEmail(email);
    if (!await this.usersService.isPasswordCorrect(password, user?.password)) {
      throw new UnauthorizedException();
    }
    const payload = { sub: user.id, name: user.name, email };
    const refreshToken = await this.getOrCreateRefreshToken(user);
    return {
      accessToken: await this.jwtService.signAsync(payload),
      refreshToken
    };
  }

  private async getOrCreateRefreshToken(user: User) {
    const payload = { sub: user.id, name: user.name, email: user.email };
    const refreshToken = user.refreshToken;

    if (!refreshToken) {
      return await this.createRefreshToken(payload, user);
    }

    if (refreshToken.expirationDate.getTime() < Date.now()) {
      return await this.updateRefreshToken(payload, refreshToken);
    }

    return refreshToken.token;
  }

  private async updateRefreshToken(payload: { sub: string; name: string; email: string }, refreshToken: RefreshToken) {
    const token = await this.jwtService.signAsync(payload, { expiresIn: "7d" });
    refreshToken.token = token;
    refreshToken.expirationDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    refreshToken.user.refreshToken = refreshToken;
    await this.usersService.update(refreshToken.user);
    return token;
  }

  private async createRefreshToken(payload: { sub: string; name: string; email: string }, user: User) {
    const token = await this.jwtService.signAsync(payload, { expiresIn: "7d" });
    user.refreshToken = new RefreshToken(token);
    await this.usersService.update(user);
    return token;
  }

  async signUp(name: string, email: string, password: string) {
    const user = await this.usersService.create(name, email, password);
    const payload = { sub: user.id, name, email };
    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.createRefreshToken(payload, user);
    return {
      accessToken: accessToken,
      refreshToken: refreshToken
    };
  }
}
