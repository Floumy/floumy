import { Module } from '@nestjs/common';
import { BipService } from './bip.service';
import { BipController } from './bip.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BipSettings } from './bip-settings.entity';
import { Org } from '../orgs/org.entity';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { OrgsModule } from '../orgs/orgs.module';
import { User } from '../users/user.entity';
import { CacheModule } from '@nestjs/cache-manager';
import { PublicController } from './public/public.controller';
import { PublicService } from './public/public.service';

@Module({
  imports: [
    CacheModule.register(),
    TypeOrmModule.forFeature([BipSettings, Org, User]),
    AuthModule,
    UsersModule,
    OrgsModule,
  ],
  providers: [BipService, PublicService],
  controllers: [BipController, PublicController],
  exports: [BipService],
})
export class BipModule {}
