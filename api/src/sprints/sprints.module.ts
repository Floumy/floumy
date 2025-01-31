import { Module } from '@nestjs/common';
import { SprintsController } from './sprints.controller';
import { SprintsService } from './sprints.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Org } from '../orgs/org.entity';
import { WorkItem } from '../backlog/work-items/work-item.entity';
import { OrgsModule } from '../orgs/orgs.module';
import { AuthModule } from '../auth/auth.module';
import { Sprint } from './sprint.entity';
import { User } from '../users/user.entity';
import { CacheModule } from '@nestjs/cache-manager';
import { PublicService } from './public/public.service';
import { PublicController } from './public/public.controller';
import { Project } from '../projects/project.entity';

@Module({
  controllers: [SprintsController, PublicController],
  imports: [
    CacheModule.register(),
    TypeOrmModule.forFeature([Org, WorkItem, Sprint, User, Project]),
    OrgsModule,
    AuthModule,
  ],
  providers: [SprintsService, PublicService],
})
export class SprintsModule {}
