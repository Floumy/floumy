import { Module } from '@nestjs/common';
import { FeatureRequestsService } from './feature-requests.service';
import { FeatureRequestsController } from './feature-requests.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Org } from '../orgs/org.entity';
import { OrgsModule } from '../orgs/orgs.module';
import { AuthModule } from '../auth/auth.module';
import { FeatureRequest } from './feature-request.entity';
import { FeatureRequestVoteService } from './feature-request-votes.service';
import { FeatureRequestVote } from './feature-request-vote.entity';
import { FeatureRequestComment } from './feature-request-comment.entity';
import { Project } from '../projects/project.entity';
import { Initiative } from '../roadmap/initiatives/initiative.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Org,
      FeatureRequest,
      FeatureRequestVote,
      FeatureRequestComment,
      Initiative,
      Project,
    ]),
    OrgsModule,
    AuthModule,
  ],
  providers: [FeatureRequestsService, FeatureRequestVoteService],
  controllers: [FeatureRequestsController],
})
export class FeatureRequestsModule {}
