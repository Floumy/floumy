import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Logger,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthDto, AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { Public } from './public.guard';
import {
  OrgSignUpDto,
  RefreshTokenDto,
  SignInDto,
  SignUpDto,
} from './auth.dtos';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('sign-in')
  @Public()
  async signIn(@Body() signInDto: SignInDto): Promise<AuthDto> {
    return await this.authService.signIn(signInDto.email, signInDto.password);
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() request): string {
    return request.user;
  }

  @Public()
  @Post('org/sign-up')
  @HttpCode(HttpStatus.CREATED)
  async orgSignUp(@Body() signUpDto: OrgSignUpDto) {
    try {
      return await this.authService.orgSignUp(signUpDto);
    } catch (e) {
      this.logger.error(e.message);
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Public()
  @Post('sign-up')
  @HttpCode(HttpStatus.CREATED)
  async signUp(@Body() signUpDto: SignUpDto) {
    try {
      return await this.authService.signUp(signUpDto);
    } catch (e) {
      this.logger.error(e.message);
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Public()
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return await this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @Public()
  @Post('activate')
  @HttpCode(HttpStatus.OK)
  async activateAccount(@Body() activationDto: { activationToken: string }) {
    try {
      return await this.authService.activateAccount(
        activationDto.activationToken,
      );
    } catch (e) {
      this.logger.error(e.message);
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Public()
  @Post('send-reset-password-link')
  @HttpCode(HttpStatus.OK)
  async requestPasswordReset(
    @Body() sendResetPasswordLinkDto: { email: string },
  ) {
    try {
      await this.authService.requestPasswordReset(
        sendResetPasswordLinkDto.email,
      );
    } catch (e) {
      this.logger.error(e.message);
    }
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() resetPasswordDto: { password: string; resetToken: string },
  ) {
    try {
      await this.authService.resetPassword(
        resetPasswordDto.password,
        resetPasswordDto.resetToken,
      );
    } catch (e) {
      this.logger.error(e.message);
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }
}
