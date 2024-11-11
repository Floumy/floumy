import { Injectable } from '@nestjs/common';
import { OrgsService } from '../../orgs/orgs.service';
import { FeedService } from '../feed.service';
import { FeedItemDto } from '../dtos';

@Injectable()
export class PublicService {
  constructor(
    private readonly feedService: FeedService,
    private readonly orgsService: OrgsService,
  ) {}

  async listFeedItems(
    orId: string,
    page: number,
    limit: number,
  ): Promise<FeedItemDto[]> {
    const org = await this.orgsService.findOneById(orId);
    const bipSettings = await org.bipSettings;

    if (
      bipSettings?.isBuildInPublicEnabled !== true ||
      bipSettings?.isFeedPagePublic !== true
    ) {
      throw new Error('Feed page is not public');
    }

    const feedItems = await this.feedService.listFeedItems(org.id, page, limit);
    // Remove assignedTo from the feed items if they
    return feedItems.map((item: FeedItemDto) => {
      delete item?.content?.assignedTo;
      delete item?.content?.current?.assignedTo;
      delete item?.content?.current?.assignedTo;
      return item;
    });
  }
}
