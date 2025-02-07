import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { OpenaiService } from './openai/openai.service';
import { ConfigModule } from '@nestjs/config';
import { RoadmapModule } from '../roadmap/roadmap.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Feature } from '../roadmap/features/feature.entity';
import { WorkItem } from '../backlog/work-items/work-item.entity';
import { KeyResult } from '../okrs/key-result.entity';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { CacheModule } from '@nestjs/cache-manager';
import { Org } from '../orgs/org.entity';
import { Project } from '../projects/project.entity';
import { Issue } from '../issues/issue.entity';
import { Milestone } from '../roadmap/milestones/milestone.entity';
import { FeatureRequest } from '../feature-requests/feature-request.entity';
import { Objective } from '../okrs/objective.entity';

@Module({
  imports: [
    ConfigModule,
    RoadmapModule,
    UsersModule,
    AuthModule,
    CacheModule.register(),
    TypeOrmModule.forFeature([
      Org,
      Project,
      Feature,
      User,
      WorkItem,
      KeyResult,
      Issue,
      Milestone,
      Milestone,
      FeatureRequest,
      Objective,
    ]),
  ],
  controllers: [AiController],
  providers: [AiService, OpenaiService],
})
export class AiModule {}
