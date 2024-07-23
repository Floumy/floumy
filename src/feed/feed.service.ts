import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FeedItem } from './feed-item.entity';
import { Repository } from 'typeorm';
import { Org } from '../orgs/org.entity';
import { User } from '../users/user.entity';
import { FeedItemMapper } from './mappers';

@Injectable()
export class FeedService {
  constructor(
    @InjectRepository(FeedItem)
    private readonly feedItemRepository: Repository<FeedItem>,
    @InjectRepository(Org) private readonly orgsRepository: Repository<Org>,
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  async listFeedItems(orgId: string, page: number, limit: number) {
    const feedItems = await this.feedItemRepository.find({
      where: { org: { id: orgId } },
      take: limit,
      skip: (page - 1) * limit,
      order: { createdAt: 'DESC' },
    });
    return feedItems.map(FeedItemMapper.toDto);
  }

  async createTextFeedItem(
    userId: string,
    orgId: string,
    textFeedItem: { text: string },
  ) {
    const user = await this.usersRepository.findOneByOrFail({ id: userId });
    const org = await user.org;
    if (org.id !== orgId) {
      throw new Error('User is not part of the org');
    }
    if (textFeedItem?.text === null || textFeedItem?.text.trim() === null) {
      throw new Error('Text is required');
    }
    const feedItem = new FeedItem();
    feedItem.org = Promise.resolve(org);
    feedItem.title = 'Text Feed Item Created';
    feedItem.entity = 'text';
    feedItem.action = 'created';
    feedItem.content = textFeedItem;
    const savedFeedItem = await this.feedItemRepository.save(feedItem);
    return FeedItemMapper.toDto(savedFeedItem);
  }
}
