import { CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { Request } from "express";
import { Reflector } from "@nestjs/core";
import { IS_PUBLIC_KEY } from "./public.guard";
import { TokensService } from "./tokens.service";

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(private tokenService: TokensService, private reflector: Reflector) {
  }

  private async isPublic(context: ExecutionContext): Promise<boolean> {
    return this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass()
    ]);
  }

  private async verifyAccessToken(request: Request, token: string) {
    try {
      request["user"] = await this.tokenService.verifyAccessToken(token);
    } catch (error) {
      this.logger.error(`Failed to verify access token: ${token}`);
      this.logger.error(error);
      throw new UnauthorizedException();
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (await this.isPublic(context)) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      this.logger.error("No token provided");
      throw new UnauthorizedException();
    }
    await this.verifyAccessToken(request, token);
    return true;
  }
}
