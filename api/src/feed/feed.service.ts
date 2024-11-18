import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FeedItem } from './feed-item.entity';
import { Repository } from 'typeorm';
import { Org } from '../orgs/org.entity';
import { User } from '../users/user.entity';
import { FeedItemMapper } from './mappers';
import { FeedItemDto } from './dtos';
import { Product } from '../products/product.entity';

@Injectable()
export class FeedService {
  constructor(
    @InjectRepository(FeedItem)
    private readonly feedItemRepository: Repository<FeedItem>,
    @InjectRepository(Org) private readonly orgsRepository: Repository<Org>,
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  async listFeedItems(
    orgId: string,
    productId: string,
    page: number,
    limit: number,
  ): Promise<FeedItemDto[]> {
    const feedItems = await this.feedItemRepository.find({
      where: { org: { id: orgId }, product: { id: productId } },
      take: limit,
      skip: (page - 1) * limit,
      order: { createdAt: 'DESC' },
    });
    return feedItems.map(FeedItemMapper.toDto);
  }

  async createTextFeedItem(
    userId: string,
    orgId: string,
    productId: string,
    textFeedItem: { text: string },
  ): Promise<FeedItemDto> {
    const user = await this.usersRepository.findOneByOrFail({
      id: userId,
      org: { id: orgId },
    });
    const org = await user.org;
    const product = await this.productsRepository.findOneByOrFail({
      id: productId,
      org: { id: orgId },
    });

    if (textFeedItem?.text === null || textFeedItem?.text.trim() === null) {
      throw new Error('Text is required');
    }
    const feedItem = new FeedItem();
    feedItem.org = Promise.resolve(org);
    feedItem.product = Promise.resolve(product);
    feedItem.title = 'Text Feed Item Created';
    feedItem.entity = 'text';
    feedItem.action = 'created';
    feedItem.content = textFeedItem;
    const savedFeedItem = await this.feedItemRepository.save(feedItem);
    return FeedItemMapper.toDto(savedFeedItem);
  }
}
