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
import { Project } from '../projects/project.entity';

@Module({
  controllers: [SprintsController],
  imports: [
    CacheModule.register(),
    TypeOrmModule.forFeature([Org, WorkItem, Sprint, User, Project]),
    OrgsModule,
    AuthModule,
  ],
  providers: [SprintsService],
})
export class SprintsModule {}
