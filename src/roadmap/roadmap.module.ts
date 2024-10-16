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
import { CacheModule } from '@nestjs/cache-manager';
import { PublicController as MilestonesPublicController } from './milestones/public/public.controller';
import { PublicService as MilestonesPublicService } from './milestones/public/public.service';
import { PublicController as FeaturesPublicController } from './features/public/public.controller';
import { PublicService as FeaturesPublicService } from './features/public/public.service';
import { StripeModule } from '../stripe/stripe.module';
import { FeatureComment } from './features/feature-comment.entity';
import { FeatureRequest } from '../feature-requests/feature-request.entity';
import { Product } from '../products/product.entity';

@Module({
  imports: [
    CacheModule.register(),
    TypeOrmModule.forFeature([
      Feature,
      Org,
      KeyResult,
      Objective,
      Milestone,
      File,
      FeatureFile,
      User,
      FeatureComment,
      FeatureRequest,
      Product,
    ]),
    OrgsModule,
    OkrsModule,
    AuthModule,
    BacklogModule,
    FilesModule,
    StripeModule,
  ],
  controllers: [
    FeaturesController,
    MilestonesController,
    FeaturesPublicController,
    MilestonesPublicController,
  ],
  providers: [
    FeaturesService,
    OrgsService,
    OkrsModule,
    MilestonesService,
    FeaturesPublicService,
    MilestonesPublicService,
  ],
})
export class RoadmapModule {}
