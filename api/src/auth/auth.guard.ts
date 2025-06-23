import { CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TokensService } from './tokens.service';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Repository } from 'typeorm';
import { BasicAuthGuard } from './basic-auth.guard';

@Injectable()
export class AuthGuard extends BasicAuthGuard implements CanActivate {
  protected readonly logger = new Logger(AuthGuard.name);

  constructor(
    protected tokenService: TokensService,
    protected reflector: Reflector,
    @InjectRepository(User) protected usersRepository: Repository<User>,
  ) {
    super(tokenService, reflector, usersRepository);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.isPublic(context)) {
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

    return true;
  }
}
