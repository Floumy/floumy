import { Module } from '@nestjs/common';
import { OrgsService } from './orgs.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Org } from './org.entity';
import { OrgsController } from './orgs.controller';
import { TokensService } from '../auth/tokens.service';
import { User } from '../users/user.entity';
import { CacheModule } from '@nestjs/cache-manager';
import { PublicController } from './public/public.controller';
import { PublicService } from './public/public.service';
import { Project } from '../projects/project.entity';

@Module({
  imports: [
    CacheModule.register(),
    TypeOrmModule.forFeature([Org, User, Project]),
    ConfigModule,
  ],
  providers: [OrgsService, TokensService, PublicService],
  exports: [OrgsService],
  controllers: [OrgsController, PublicController],
})
export class OrgsModule {}
