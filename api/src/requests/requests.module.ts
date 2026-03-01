import { Module } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { RequestsController } from './requests.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Org } from '../orgs/org.entity';
import { OrgsModule } from '../orgs/orgs.module';
import { AuthModule } from '../auth/auth.module';
import { Request } from './request.entity';
import { RequestVoteService } from './request-votes.service';
import { RequestVote } from './request-vote.entity';
import { RequestComment } from './request-comment.entity';
import { Project } from '../projects/project.entity';
import { Initiative } from '../roadmap/initiatives/initiative.entity';
import { BipModule } from '../bip/bip.module';
import { PublicController as RequestsPublicController } from './public/public.controller';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    CacheModule.register(),
    TypeOrmModule.forFeature([
      User,
      Org,
      Request,
      RequestVote,
      RequestComment,
      Initiative,
      Project,
    ]),
    OrgsModule,
    AuthModule,
    BipModule,
  ],
  providers: [RequestsService, RequestVoteService],
  controllers: [RequestsController, RequestsPublicController],
})
export class RequestsModule {}
