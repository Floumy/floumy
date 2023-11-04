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

  async signIn(email: string, password: string): Promise<AuthDto> {
    const user = await this.usersService.findOneByEmail(email);
    if (!await this.usersService.isPasswordCorrect(password, user?.password)) {
      throw new UnauthorizedException();
    }

    const payload = { sub: user.id, name: user.name, email };

    return {
      accessToken: await this.jwtService.signAsync(payload)
    };
  }

  async signUp(name: string, email: string, password: string) {
    const user = await this.usersService.create(name, email, password);
    const payload = { sub: user.id, name, email };

    return {
      accessToken: await this.jwtService.signAsync(payload)
    };
  }
}
