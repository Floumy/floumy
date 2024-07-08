import { Module } from '@nestjs/common';
import { FeedService } from './feed.service';
import { FeedController } from './feed.controller';
import { FeedEventHandler } from './feed.event-handler';

@Module({
  providers: [FeedService, FeedEventHandler],
  controllers: [FeedController],
})
export class FeedModule {}
