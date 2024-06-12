import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './public.guard';
import { TokensService } from './tokens.service';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Repository } from 'typeorm';
import { OrgsService } from '../orgs/orgs.service';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(
    private tokenService: TokensService,
    private reflector: Reflector,
    @InjectRepository(User) private usersRepository: Repository<User>,
    private orgsService: OrgsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (await this.isPublic(context)) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
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

    const org = request['user'].org;
    if (!org) {
      this.logger.error('No org found for user');
      throw new UnauthorizedException();
    }

    const hasActiveSubscription =
      await this.orgsService.hasActiveSubscription(org);
    if (!hasActiveSubscription) {
      this.logger.error('No active subscription found for org');
      throw new HttpException('No active subscription found', 402);
    }

    return true;
  }

  private async isPublic(context: ExecutionContext): Promise<boolean> {
    return this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
  }

  private async verifyAccessToken(request: Request, token: string) {
    try {
      const userDetails = await this.tokenService.verifyAccessToken(token);
      await this.usersRepository.findOneByOrFail({
        id: userDetails.sub,
        isActive: true,
      });
      request['user'] = userDetails;
    } catch (error) {
      this.logger.error(`Failed to verify access token: ${token}`);
      this.logger.error(error);
      throw new UnauthorizedException();
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
