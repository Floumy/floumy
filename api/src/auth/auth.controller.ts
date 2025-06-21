import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Logger,
  Post,
  Req,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { Public } from './public.guard';
import { OrgSignUpDto, SignInDto, SignUpDto } from './auth.dtos';
import * as process from 'node:process';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('sign-in')
  @Public()
  async signIn(
    @Body() signInDto: SignInDto,
    @Res({ passthrough: true }) response,
  ): Promise<{ lastSignedIn: Date }> {
    const authData = await this.authService.signIn(
      signInDto.email,
      signInDto.password,
    );

    response.cookie('accessToken', authData.accessToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });

    response.cookie('refreshToken', authData.refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });

    return { lastSignedIn: authData.lastSignedIn };
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
  async refreshToken(@Req() request, @Res({ passthrough: true }) response) {
    const res = await this.authService.refreshToken(
      request.cookies?.refreshToken,
    );

    response.cookie('accessToken', res.accessToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });

    response.cookie('refreshToken', res.refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });
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

  @UseGuards(AuthGuard)
  @Get('is-authenticated')
  @HttpCode(HttpStatus.OK)
  async isAuthenticated(@Request() request) {
    try {
      return { isAuthenticated: !!request.user };
    } catch (e) {
      this.logger.error(e.message);
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() request: Request, @Res({ passthrough: true }) response) {
    try {
      // Clear cookies
      response.clearCookie('accessToken', {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
      });
      response.clearCookie('refreshToken', {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
      });
    } catch (e) {
      this.logger.error(e.message);
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
