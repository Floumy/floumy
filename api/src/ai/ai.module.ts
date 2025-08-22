import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { OpenaiService } from './openai/openai.service';
import { ConfigModule } from '@nestjs/config';
import { RoadmapModule } from '../roadmap/roadmap.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Initiative } from '../roadmap/initiatives/initiative.entity';
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
import { ChatController } from './chat/chat.controller';
import { ChatService } from './chat/chat.service';
import { DocumentVectorStoreService } from './documents/document-vector-store.service';
import { IndexingController } from './documents/indexing.controller';
import { IndexingService } from './documents/indexing.service';
import { Sprint } from '../sprints/sprint.entity';
import { WorkItemsToolsService } from './chat/tools/work-items-tools.service';
import { Page } from 'src/pages/pages.entity';
import { IndexingEventHandlerService } from './documents/indexing-event-handler.service';

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
      Initiative,
      User,
      WorkItem,
      KeyResult,
      Issue,
      Milestone,
      FeatureRequest,
      Objective,
      Sprint,
      Page,
    ]),
  ],
  controllers: [AiController, ChatController, IndexingController],
  providers: [
    AiService,
    OpenaiService,
    ChatService,
    DocumentVectorStoreService,
    IndexingService,
    WorkItemsToolsService,
    IndexingEventHandlerService,
  ],
})
export class AiModule {}
