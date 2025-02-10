import { Module } from '@nestjs/common';
import { OkrsService } from './okrs.service';
import { OkrsController } from './okrs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Objective } from './objective.entity';
import { OrgsModule } from '../orgs/orgs.module';
import { AuthModule } from '../auth/auth.module';
import { KeyResult } from './key-result.entity';
import { Initiative } from '../roadmap/initiatives/initiative.entity';
import { User } from '../users/user.entity';
import { CacheModule } from '@nestjs/cache-manager';
import { PublicController } from './public/public.controller';
import { PublicService } from './public/public.service';
import { Org } from '../orgs/org.entity';
import { CommentsService } from './comments/comments.service';
import { KeyResultComment } from './key-result-comment.entity';
import { ObjectiveComment } from './objective-comment.entity';
import { Project } from '../projects/project.entity';

@Module({
  imports: [
    CacheModule.register(),
    TypeOrmModule.forFeature([
      Objective,
      KeyResult,
      Initiative,
      User,
      Org,
      KeyResultComment,
      ObjectiveComment,
      Project,
    ]),
    OrgsModule,
    AuthModule,
  ],
  providers: [OkrsService, PublicService, CommentsService],
  controllers: [OkrsController, PublicController],
  exports: [OkrsService],
})
export class OkrsModule {}
