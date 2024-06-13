import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TokensService } from './tokens.service';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Repository } from 'typeorm';
import { OrgsService } from '../orgs/orgs.service';
import { BasicAuthGuard } from './basic-auth.guard';

@Injectable()
export class AuthGuard extends BasicAuthGuard implements CanActivate {
  protected readonly logger = new Logger(AuthGuard.name);

  constructor(
    protected tokenService: TokensService,
    protected reflector: Reflector,
    @InjectRepository(User) protected usersRepository: Repository<User>,
    private orgsService: OrgsService,
  ) {
    super(tokenService, reflector, usersRepository);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (await this.isPublic(context)) {
      return true;
    }

    const canActivate = await super.canActivate(context);
    if (!canActivate) {
      return false;
    }

    const org = this.userDetails.org;
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
}
