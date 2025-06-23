import { CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './public.guard';
import { TokensService } from './tokens.service';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Repository } from 'typeorm';
import { UserRole } from '../users/enums';

@Injectable()
export class BasicAuthGuard implements CanActivate {
  protected readonly logger = new Logger(BasicAuthGuard.name);
  protected userDetails: {
    sub: string;
    org: string;
    role: UserRole;
  };

  constructor(
    protected tokenService: TokensService,
    protected reflector: Reflector,
    @InjectRepository(User) protected usersRepository: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.isPublic(context)) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromCookie(request);
    if (!token) {
      this.logger.error('No token provided');
      throw new UnauthorizedException();
    }

    try {
      await this.verifyAccessToken(request, token);
    } catch (e) {
      this.logger.error('Failed to verify access token');
      this.logger.error(e);
      throw new UnauthorizedException();
    }

    const requiredRoles = this.getRequiredRoles(context);
    if (requiredRoles && !requiredRoles.includes(this.userDetails.role)) {
      this.logger.error('User does not have required role');
      throw new UnauthorizedException();
    }

    return true;
  }

  protected getRequiredRoles(
    context: ExecutionContext,
  ): UserRole[] | undefined {
    return this.reflector.getAllAndOverride<UserRole[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
  }

  protected isPublic(context: ExecutionContext): boolean {
    return this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
  }

  protected async verifyAccessToken(request: Request, token: string) {
    try {
      const tokenDetails = await this.tokenService.verifyAccessToken(token);
      const user = await this.usersRepository.findOneByOrFail({
        id: tokenDetails.sub,
        org: {
          id: tokenDetails.org,
        },
        isActive: true,
      });
      this.userDetails = {
        sub: tokenDetails.sub,
        org: tokenDetails.org,
        role: user.role,
      };
      request['user'] = {
        sub: tokenDetails.sub,
        org: tokenDetails.org,
        role: user.role,
      };
    } catch (error) {
      this.logger.error(`Failed to verify access token: ${token}`);
      this.logger.error(error);
      throw new UnauthorizedException();
    }
  }

  protected extractTokenFromCookie(request: Request): string | undefined {
    return request.cookies?.accessToken;
  }
}
