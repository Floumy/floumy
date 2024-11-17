import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { ConfigModule } from '@nestjs/config';
import { OrgsModule } from '../orgs/orgs.module';
import { UsersController } from './users.controller';
import { AuthGuard } from '../auth/auth.guard';
import { TokensService } from '../auth/tokens.service';
import { RefreshToken } from '../auth/refresh-token.entity';
import { StripeModule } from '../stripe/stripe.module';

@Module({
  imports: [
    OrgsModule,
    TypeOrmModule.forFeature([User, RefreshToken]),
    ConfigModule,
    StripeModule,
  ],
  providers: [UsersService, AuthGuard, TokensService],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
