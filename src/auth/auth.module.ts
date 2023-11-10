import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { UsersModule } from "../users/users.module";
import { JwtModule } from "@nestjs/jwt";
import { jwtConstants } from "./constants";
import { APP_GUARD } from "@nestjs/core";
import { AuthGuard } from "./auth.guard";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RefreshToken } from "./refresh-token.entity";
import { ConfigService } from "@nestjs/config";
import { TokensService } from "./tokens.service";

@Module({
  controllers: [AuthController],
  providers: [AuthService,
    ConfigService,
    TokensService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard
    }],
  imports: [
    UsersModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: "60s" }
    }),
    TypeOrmModule.forFeature([RefreshToken])
  ],
  exports: [AuthService, TokensService]
})
export class AuthModule {
}
