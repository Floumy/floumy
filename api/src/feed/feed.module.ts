import { Module } from '@nestjs/common';
import { FeedService } from './feed.service';
import { FeedController } from './feed.controller';
import { FeedEventHandler } from './feed.event-handler';
import { User } from '../users/user.entity';
import { Org } from '../orgs/org.entity';
import { FeedItem } from './feed-item.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { OrgsModule } from '../orgs/orgs.module';
import { CacheModule } from '@nestjs/cache-manager';
import { Project } from '../projects/project.entity';

@Module({
  imports: [
    CacheModule.register(),
    AuthModule,
    OrgsModule,
    TypeOrmModule.forFeature([User, Org, FeedItem, Project]),
  ],
  providers: [FeedService, FeedEventHandler],
  controllers: [FeedController],
})
export class FeedModule {}
