import { AuthService } from "./auth.service";
import { TestingModule } from "@nestjs/testing";
import { UsersModule } from "../users/users.module";
import { AuthGuard } from "./auth.guard";
import { JwtService } from "@nestjs/jwt";
import { Reflector } from "@nestjs/core";
import { ExecutionContext } from "@nestjs/common";
import { setupTestingModule } from "../../test/test.utils";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RefreshToken } from "./refresh-token.entity";

describe("AuthGuard", () => {
  let jwtService: JwtService;
  let module: TestingModule;
  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    const { module: testingModule, cleanup: dbCleanup } = await setupTestingModule(
      [UsersModule, TypeOrmModule.forFeature([RefreshToken])],
      [AuthService, Reflector]
    );
    module = testingModule;
    cleanup = dbCleanup;
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(async () => {
    await cleanup();
  });

  it("should be defined", () => {
    const reflector = module.get<Reflector>(Reflector);
    const guard = new AuthGuard(jwtService, reflector);
    expect(guard).toBeInstanceOf(AuthGuard);
  });

  it("should return true when the handler is public", async () => {
    // TODO: Refactor this horrendous mock
    const reflector = {
      getAllAndOverride: () => {
        return true;
      }
    } as unknown as Reflector;
    const guard = new AuthGuard(jwtService, reflector);
    const context = {
      getHandler: () => {
      },
      getClass: () => {
      }
    } as ExecutionContext;
    const isPublic = await guard["isPublic"](context);
    expect(isPublic).toBe(true);
  });

  it("should return false when the handler is not public", async () => {
    // TODO: Refactor this horrendous mock
    const reflector = {
      getAllAndOverride: () => {
        return false;
      }
    } as unknown as Reflector;
    const guard = new AuthGuard(jwtService, reflector);
    const context = {
      getHandler: () => {
      },
      getClass: () => {
      }
    } as ExecutionContext;
    const isPublic = await guard["isPublic"](context);
    expect(isPublic).toBe(false);
  });

  it("should throw an error when no token is provided", async () => {
    // TODO: Refactor this horrendous mock
    const reflector = {
      getAllAndOverride: () => {
        return false;
      }
    } as unknown as Reflector;
    const guard = new AuthGuard(jwtService, reflector);
    const context = {
      switchToHttp: () => {
        return {
          getRequest: () => {
            return {
              headers: {
                authorization: undefined
              }
            };
          }
        };
      }
    } as ExecutionContext;
    await expect(guard.canActivate(context)).rejects.toThrow();
  });

  it("should throw an error when the token is invalid", async () => {
    // TODO: Refactor this horrendous mock
    const reflector = {
      getAllAndOverride: () => {
        return false;
      }
    } as unknown as Reflector;
    const guard = new AuthGuard(jwtService, reflector);
    const context = {
      switchToHttp: () => {
        return {
          getRequest: () => {
            return {
              headers: {
                authorization: "Bearer invalid"
              }
            };
          }
        };
      }
    } as ExecutionContext;
    await expect(guard.canActivate(context)).rejects.toThrow();
  });

  it("should return true when the token is valid", async () => {
    // TODO: Refactor this horrendous mock
    const reflector = {
      getAllAndOverride: () => {
        return false;
      }
    } as unknown as Reflector;
    const guard = new AuthGuard(jwtService, reflector);
    const context = {
      getHandler: () => {

      },
      getClass: () => {

      },
      switchToHttp: () => {
        return {
          getRequest: () => {
            return {
              headers: {
                authorization: "Bearer " + jwtService.sign({ sub: "test", username: "test" })
              }
            };
          }
        };
      }
    } as ExecutionContext;
    const canActivate = await guard.canActivate(context);
    expect(canActivate).toBe(true);
  });
});
