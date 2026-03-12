import { Module } from '@nestjs/common';
import { CyclesController } from './cycles.controller';
import { CyclesService } from './cycles.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Org } from '../orgs/org.entity';
import { WorkItem } from '../backlog/work-items/work-item.entity';
import { OrgsModule } from '../orgs/orgs.module';
import { AuthModule } from '../auth/auth.module';
import { Cycle } from './cycle.entity';
import { User } from '../users/user.entity';
import { CacheModule } from '@nestjs/cache-manager';
import { PublicService } from './public/public.service';
import { PublicController } from './public/public.controller';
import { Project } from '../projects/project.entity';

@Module({
  controllers: [CyclesController, PublicController],
  imports: [
    CacheModule.register(),
    TypeOrmModule.forFeature([Org, WorkItem, Cycle, User, Project]),
    OrgsModule,
    AuthModule,
  ],
  providers: [CyclesService, PublicService],
  exports: [CyclesService],
})
export class CyclesModule {}
