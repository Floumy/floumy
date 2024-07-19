import { Injectable } from '@nestjs/common';
import { OrgsService } from '../../orgs/orgs.service';
import { FeedService } from '../feed.service';

@Injectable()
export class PublicService {
  constructor(
    private readonly feedService: FeedService,
    private readonly orgsService: OrgsService,
  ) {}

  async listFeedItems(orId: string, page: number, limit: number) {
    const org = await this.orgsService.findOneById(orId);
    const bipSettings = await org.bipSettings;

    if (
      bipSettings?.isBuildInPublicEnabled !== true ||
      bipSettings?.isFeedPagePublic !== true
    ) {
      throw new Error('Feed page is not public');
    }

    return await this.feedService.listFeedItems(org.id, page, limit);
  }
}
