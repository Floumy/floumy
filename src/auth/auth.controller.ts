import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards, Request } from "@nestjs/common";
import { AuthDto, AuthService } from "./auth.service";
import { AuthGuard } from "./auth.guard";

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
  signIn(@Body() signInDto: SignInDto): Promise<AuthDto> {
    return this.authService.signIn(signInDto.username, signInDto.password);
  }

  @UseGuards(AuthGuard)
  @Get("profile")
  getProfile(@Request() request): string {
    // request.username is actually the decoded jwt payload
    return request.user;
  }
}
