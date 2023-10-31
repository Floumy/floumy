import {Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards, Request, HttpException} from "@nestjs/common";
import {AuthDto, AuthService} from "./auth.service";
import {AuthGuard} from "./auth.guard";
import {Public} from "./public.guard";

type SignInDto = {
    username: string;
    password: string;
}

@Controller("auth")
export class AuthController {
    constructor(private authService: AuthService) {
    }

    @HttpCode(HttpStatus.OK)
    @Post("sign-in")
    @Public()
    signIn(@Body() signInDto: SignInDto): Promise<AuthDto> {
        return this.authService.signIn(signInDto.username, signInDto.password);
    }

    @UseGuards(AuthGuard)
    @Get("profile")
    getProfile(@Request() request): string {
        // request.username is actually the decoded jwt payload
        return request.user;
    }

    @Public()
    @Post("sign-up")
    @HttpCode(HttpStatus.CREATED)
    async signUp(@Body() signUpDto: { password: string; username: string }) {
        try {
            return await this.authService.signUp(signUpDto.username, signUpDto.password);
        } catch (e) {
            throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
        }
    }
}
