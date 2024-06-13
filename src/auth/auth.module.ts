import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { AuthGuard } from './auth.guard';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken } from './refresh-token.entity';
import { ConfigService } from '@nestjs/config';
import { TokensService } from './tokens.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { User } from '../users/user.entity';
import { RefreshTokensCleanerService } from './referesh-tokens-cleaner.service';
import { OrgsModule } from '../orgs/orgs.module';
import { BasicAuthGuard } from './basic-auth.guard';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    ConfigService,
    TokensService,
    RefreshTokensCleanerService,
    BasicAuthGuard,
    AuthGuard,
  ],
  imports: [
    UsersModule,
    NotificationsModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60s' },
    }),
    TypeOrmModule.forFeature([RefreshToken, User]),
    OrgsModule,
  ],
  exports: [AuthService, TokensService, BasicAuthGuard],
})
export class AuthModule {}
