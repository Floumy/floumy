import { Module } from '@nestjs/common';
import { FeedService } from './feed.service';
import { FeedController } from './feed.controller';
import { FeedEventHandler } from './feed.event-handler';
import { User } from '../users/user.entity';
import { Org } from '../orgs/org.entity';
import { FeedItem } from './feed-item.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([User, Org, FeedItem])],
  providers: [FeedService, FeedEventHandler],
  controllers: [FeedController],
})
export class FeedModule {}
