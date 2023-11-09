import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class TokensService {
  constructor(private configService: ConfigService,
              private jwtService: JwtService) {
  }


  async generateAccessToken(payload: object | Buffer) {
    return await this.jwtService.signAsync(payload, { expiresIn: this.configService.get("jwt.accessToken.expiresIn"), secret: this.configService.get("jwt.accessToken.secret") });
  }

  async generateRefreshToken(payload: object | Buffer) {
    return await this.jwtService.signAsync(payload, { expiresIn: this.configService.get("jwt.refreshToken.expiresIn"), secret: this.configService.get("jwt.refreshToken.secret") });
  }

  async verifyAccessToken(accessToken: string) {
    return await this.jwtService.verifyAsync(accessToken, { secret: this.configService.get("jwt.accessToken.secret") });
  }

  async verifyRefreshToken(refreshToken: string) {
    return await this.jwtService.verifyAsync(refreshToken, { secret: this.configService.get("jwt.refreshToken.secret") });
  }
}
