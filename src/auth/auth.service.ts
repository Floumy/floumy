import {Injectable, UnauthorizedException} from "@nestjs/common";
import {UsersService} from "../users/users.service";
import {JwtService} from "@nestjs/jwt";

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
        if (!await this.usersService.isPasswordCorrect(password, user?.password)) {
            throw new UnauthorizedException();
        }
        const payload = {sub: user.id, username: username};

        return {
            accessToken: await this.jwtService.signAsync(payload)
        };
    }

    async signUp(username: string, password: string) {
        const user = await this.usersService.create(username, password);
        const payload = {sub: user.id, username: username};

        return {
            accessToken: await this.jwtService.signAsync(payload)
        };
    }
}
