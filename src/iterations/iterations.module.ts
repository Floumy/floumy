import { Module } from '@nestjs/common';
import { IterationsController } from './iterations.controller';
import { IterationsService } from './iterations.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Org } from '../orgs/org.entity';
import { WorkItem } from '../backlog/work-items/work-item.entity';
import { OrgsModule } from '../orgs/orgs.module';
import { AuthModule } from '../auth/auth.module';
import { Iteration } from './Iteration.entity';
import { User } from '../users/user.entity';
import { CacheModule } from '@nestjs/cache-manager';
import { PublicService } from './public/public.service';
import { PublicController } from './public/public.controller';

@Module({
  controllers: [IterationsController, PublicController],
  imports: [
    CacheModule.register(),
    TypeOrmModule.forFeature([Org, WorkItem, Iteration, User]),
    OrgsModule,
    AuthModule,
  ],
  providers: [IterationsService, PublicService],
})
export class IterationsModule {}
