import { Injectable } from '@nestjs/common';
import { FeedService } from '../feed.service';
import { FeedItemDto } from '../dtos';
import { Product } from '../../products/product.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PublicService {
  constructor(
    private readonly feedService: FeedService,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  async listFeedItems(
    orgId: string,
    productId: string,
    page: number,
    limit: number,
  ): Promise<FeedItemDto[]> {
    const product = await this.productsRepository.findOneByOrFail({
      id: productId,
      org: { id: orgId },
    });

    const bipSettings = await product.bipSettings;

    if (
      bipSettings?.isBuildInPublicEnabled !== true ||
      bipSettings?.isFeedPagePublic !== true
    ) {
      throw new Error('Feed page is not public');
    }

    const feedItems = await this.feedService.listFeedItems(
      orgId,
      productId,
      page,
      limit,
    );

    // Remove assignedTo from the feed items
    return feedItems.map((item: FeedItemDto) => {
      delete item?.content?.assignedTo;
      delete item?.content?.current?.assignedTo;
      delete item?.content?.current?.assignedTo;
      return item;
    });
  }
}
