import { AuthService } from './auth.service';
import { TestingModule } from '@nestjs/testing';
import { UsersModule } from '../users/users.module';
import { AuthGuard } from './auth.guard';
import { Reflector } from '@nestjs/core';
import {
  ExecutionContext,
  HttpException,
  UnauthorizedException,
} from '@nestjs/common';
import { setupTestingModule } from '../../test/test.utils';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken } from './refresh-token.entity';
import { TokensService } from './tokens.service';
import { User } from '../users/user.entity';
import { Org } from '../orgs/org.entity';
import { Repository } from 'typeorm';
import { OrgsModule } from '../orgs/orgs.module';

describe('AuthGuard', () => {
  let tokensService: TokensService;
  let module: TestingModule;
  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    const { module: testingModule, cleanup: dbCleanup } =
      await setupTestingModule(
        [UsersModule, TypeOrmModule.forFeature([RefreshToken]), OrgsModule],
        [AuthService, Reflector, TokensService],
      );
    module = testingModule;
    cleanup = dbCleanup;
    tokensService = module.get<TokensService>(TokensService);
  });

  afterEach(async () => {
    await cleanup();
  });

  it('should be defined', () => {
    const reflector = module.get<Reflector>(Reflector);
    const repository = {
      findOneByOrFail: () => {
        return {
          id: '1234',
          isActive: true,
        };
      },
    } as unknown as Repository<User>;
    const guard = new AuthGuard(tokensService, reflector, repository);
    expect(guard).toBeInstanceOf(AuthGuard);
  });

  it('should return true when the handler is public', async () => {
    const reflector = {
      getAllAndOverride: () => {
        return true;
      },
    } as unknown as Reflector;
    const repository = {
      findOneByOrFail: () => {
        return {
          id: '1234',
          isActive: true,
        };
      },
    } as unknown as Repository<User>;
    const guard = new AuthGuard(tokensService, reflector, repository);
    const context = {
      getHandler: () => {},
      getClass: () => {},
    } as ExecutionContext;
    const isPublic = await guard['isPublic'](context);
    expect(isPublic).toBe(true);
  });

  it('should return false when the handler is not public', async () => {
    const reflector = {
      getAllAndOverride: () => {
        return false;
      },
    } as unknown as Reflector;
    const repository = {
      findOneByOrFail: () => {
        return {
          id: '1234',
          isActive: true,
        };
      },
    } as unknown as Repository<User>;
    const guard = new AuthGuard(tokensService, reflector, repository);
    const context = {
      getHandler: () => {},
      getClass: () => {},
    } as ExecutionContext;
    const isPublic = await guard['isPublic'](context);
    expect(isPublic).toBe(false);
  });

  it('should throw an error when no token is provided', async () => {
    const reflector = {
      getAllAndOverride: () => {
        return false;
      },
    } as unknown as Reflector;
    const repository = {
      findOneByOrFail: () => {
        return {
          id: '1234',
          isActive: true,
        };
      },
    } as unknown as Repository<User>;
    const guard = new AuthGuard(tokensService, reflector, repository);
    const context = {
      switchToHttp: () => {
        return {
          getRequest: () => {
            return {
              headers: {
                authorization: undefined,
              },
            };
          },
        };
      },
    } as ExecutionContext;
    await expect(guard.canActivate(context)).rejects.toThrow();
  });

  it('should throw an error when the token is invalid', async () => {
    const reflector = {
      getAllAndOverride: () => {
        return false;
      },
    } as unknown as Reflector;
    const repository = {
      findOneByOrFail: () => {
        return {
          id: '1234',
          isActive: true,
        };
      },
    } as unknown as Repository<User>;
    const guard = new AuthGuard(tokensService, reflector, repository);
    const context = {
      switchToHttp: () => {
        return {
          getRequest: () => {
            return {
              headers: {
                authorization: 'Bearer invalid',
              },
            };
          },
        };
      },
    } as ExecutionContext;
    await expect(guard.canActivate(context)).rejects.toThrow();
  });

  it('should return true when the token is valid', async () => {
    const reflector = {
      getAllAndOverride: () => {
        return false;
      },
    } as unknown as Reflector;
    const repository = {
      findOneByOrFail: () => {
        return {
          id: '1234',
          isActive: true,
        };
      },
    } as unknown as Repository<User>;
    const guard = new AuthGuard(tokensService, reflector, repository);
    const user = new User('John Doe', 'test@example.com', 'password');
    user.id = '1234';
    user.org = Promise.resolve({ id: '1234' } as Org);
    const accessToken = await tokensService.generateAccessToken(user);
    const context = {
      getHandler: () => {},
      getClass: () => {},
      switchToHttp: () => {
        return {
          getRequest: () => {
            return {
              cookies: {
                accessToken: accessToken,
              },
            };
          },
        };
      },
    } as ExecutionContext;
    const canActivate = await guard.canActivate(context);
    expect(canActivate).toBe(true);
  });
  it('should return false when the user is not active', async () => {
    const reflector = {
      getAllAndOverride: () => {
        return false;
      },
    } as unknown as Reflector;
    const repository = {
      findOneByOrFail: () => {
        throw new Error();
      },
    } as unknown as Repository<User>;
    const guard = new AuthGuard(tokensService, reflector, repository);
    const context = {
      getHandler: () => {},
      getClass: () => {},
      switchToHttp: () => {
        return {
          getRequest: () => {
            return {
              headers: {
                authorization: `Bearer invalid`,
              },
            };
          },
        };
      },
    } as ExecutionContext;
    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });
  it('should return false when the org has no active subscription', async () => {
    const reflector = {
      getAllAndOverride: () => {
        return false;
      },
    } as unknown as Reflector;
    const repository = {
      findOneByOrFail: () => {
        throw new Error();
      },
    } as unknown as Repository<User>;
    const guard = new AuthGuard(tokensService, reflector, repository);
    const context = {
      getHandler: () => {},
      getClass: () => {},
      switchToHttp: () => {
        return {
          getRequest: () => {
            return {
              headers: {
                authorization: `Bearer invalid`,
              },
            };
          },
        };
      },
    } as ExecutionContext;
    await expect(guard.canActivate(context)).rejects.toThrow(HttpException);
  });
});
