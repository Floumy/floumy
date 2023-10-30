import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { JwtService } from "@nestjs/jwt";

export type AuthDto = {
  accessToken: string;
}

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService,
              private jwtService: JwtService) {
  }

  async signIn(username: string, password: string): Promise<AuthDto> {
    const user = await this.usersService.findOne(username);
    if (user?.password !== password) {
      throw new UnauthorizedException();
    }
    const payload = { sub: user.userId, username: username };

    return {
      accessToken: await this.jwtService.signAsync(payload)
    };
  }
}
