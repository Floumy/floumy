import { Module } from '@nestjs/common';
import { OrgsService } from './orgs.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Org } from './org.entity';
import { OrgsController } from './orgs.controller';
import { TokensService } from '../auth/tokens.service';
import { User } from '../users/user.entity';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    CacheModule.register(),
    TypeOrmModule.forFeature([Org, User]),
    ConfigModule,
  ],
  providers: [OrgsService, TokensService],
  exports: [OrgsService],
  controllers: [OrgsController],
})
export class OrgsModule {}
