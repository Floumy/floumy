import { Module } from '@nestjs/common';
import { FeaturesController } from './features/features.controller';
import { FeaturesService } from './features/features.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrgsModule } from '../orgs/orgs.module';
import { Feature } from './features/feature.entity';
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
import { FeatureFile } from './features/feature-file.entity';
import { User } from '../users/user.entity';
import { FilesModule } from '../files/files.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Feature,
      Org,
      KeyResult,
      Objective,
      Milestone,
      File,
      FeatureFile,
      User,
    ]),
    OrgsModule,
    OkrsModule,
    AuthModule,
    BacklogModule,
    FilesModule,
  ],
  controllers: [FeaturesController, MilestonesController],
  providers: [FeaturesService, OrgsService, OkrsModule, MilestonesService],
})
export class RoadmapModule {}
