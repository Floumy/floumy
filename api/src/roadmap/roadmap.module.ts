import { Module } from '@nestjs/common';
import { InitiativesController } from './initiatives/initiatives.controller';
import { InitiativesService } from './initiatives/initiatives.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrgsModule } from '../orgs/orgs.module';
import { Initiative } from './initiatives/initiative.entity';
import { OkrsModule } from '../okrs/okrs.module';
import { OrgsService } from '../orgs/orgs.service';
import { Org } from '../orgs/org.entity';
import { KeyResult } from '../okrs/key-result.entity';
import { Objective } from '../okrs/objective.entity';
import { AuthModule } from 'src/auth/auth.module';
import { MilestonesController } from './milestones/milestones.controller';
import { MilestonesService } from './milestones/milestones.service';
import { Milestone } from './milestones/milestone.entity';
import { BacklogModule } from '../backlog/backlog.module';
import { File } from '../files/file.entity';
import { InitiativeFile } from './initiatives/initiative-file.entity';
import { User } from '../users/user.entity';
import { FilesModule } from '../files/files.module';
import { CacheModule } from '@nestjs/cache-manager';
import { PublicController as MilestonesPublicController } from './milestones/public/public.controller';
import { PublicService as MilestonesPublicService } from './milestones/public/public.service';
import { PublicController as FeaturesPublicController } from './initiatives/public/public.controller';
import { PublicService as FeaturesPublicService } from './initiatives/public/public.service';
import { InitiativeComment } from './initiatives/initiative-comment.entity';
import { FeatureRequest } from '../feature-requests/feature-request.entity';
import { Project } from '../projects/project.entity';
import { NotificationListener } from '../notifications/notification.listener';
import { Notification } from '../notifications/notification.entity';

@Module({
  imports: [
    CacheModule.register(),
    TypeOrmModule.forFeature([
      Initiative,
      Org,
      KeyResult,
      Objective,
      Milestone,
      File,
      InitiativeFile,
      User,
      Initiative,
      InitiativeComment,
      FeatureRequest,
      Project,
      Notification,
    ]),
    OrgsModule,
    OkrsModule,
    AuthModule,
    BacklogModule,
    FilesModule,
  ],
  controllers: [
    InitiativesController,
    MilestonesController,
    FeaturesPublicController,
    MilestonesPublicController,
  ],
  providers: [
    InitiativesService,
    OrgsService,
    OkrsModule,
    MilestonesService,
    FeaturesPublicService,
    MilestonesPublicService,
    NotificationListener,
  ],
  exports: [InitiativesService],
})
export class RoadmapModule {}
