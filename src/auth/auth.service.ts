import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { User } from "../users/user.entity";
import { RefreshToken } from "./refresh-token.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { TokensService } from "./tokens.service";
import { SignUpDto } from "./auth.dtos";

export type AuthDto = {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private usersService: UsersService,
              @InjectRepository(RefreshToken)
              private refreshTokenRepository: Repository<RefreshToken>,
              private tokensService: TokensService) {
  }

  async signIn(email: string, password: string): Promise<AuthDto> {
    const user = await this.usersService.findOneByEmail(email);
    if (!await this.usersService.isPasswordCorrect(password, user?.password)) {
      this.logger.error("Invalid credentials");
      throw new UnauthorizedException();
    }
    const refreshToken = await this.getOrCreateRefreshToken(user);
    return {
      accessToken: await this.tokensService.generateAccessToken(user),
      refreshToken
    };
  }

  private async getOrCreateRefreshToken(user: User) {
    const refreshToken = await this.refreshTokenRepository.findOne({
      where: { user: { id: user.id } },
      order: { createdAt: "DESC" }
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

  async signUp(signUpDto: SignUpDto): Promise<AuthDto> {
    const user = await this.usersService.create(signUpDto.name, signUpDto.email, signUpDto.password, signUpDto.invitationToken);
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
      this.logger.error(e.message);
      throw new UnauthorizedException();
    }

    const refreshTokenEntity = await this.refreshTokenRepository.findOneBy({ token: refreshToken });

    if (!refreshTokenEntity) {
      this.logger.error("Refresh token not found");
      throw new UnauthorizedException();
    }

    if (refreshTokenEntity.expirationDate.getTime() < Date.now()) {
      this.logger.error("Refresh token expired");
      throw new UnauthorizedException();
    }

    const user = await refreshTokenEntity.user;
    return {
      accessToken: await this.tokensService.generateAccessToken(user),
      refreshToken: await this.createRefreshToken(user)
    };
  }
}
