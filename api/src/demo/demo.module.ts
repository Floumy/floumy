import { Module } from '@nestjs/common';
import { DemoService } from './demo.service';
import { DemoController } from './demo.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkItem } from '../backlog/work-items/work-item.entity';
import { Initiative } from '../roadmap/initiatives/initiative.entity';
import { OkrsModule } from '../okrs/okrs.module';
import { RoadmapModule } from '../roadmap/roadmap.module';
import { BacklogModule } from '../backlog/backlog.module';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { User } from '../users/user.entity';
import { Org } from '../orgs/org.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Initiative, WorkItem, User, Org]),
    OkrsModule,
    RoadmapModule,
    BacklogModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [DemoController],
  providers: [DemoService],
})
export class DemoModule {}
