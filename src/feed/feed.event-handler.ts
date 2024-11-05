import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeedItem } from './feed-item.entity';
import { WorkItemDto } from '../backlog/work-items/dtos';
import { Org } from '../orgs/org.entity';
import { User } from '../users/user.entity';
import { KeyResultDto, OKRDto } from '../okrs/dtos';
import { FeatureDto } from '../roadmap/features/dtos';
import { Product } from '../products/product.entity';

@Injectable()
export class FeedEventHandler {
  constructor(
    @InjectRepository(FeedItem)
    private readonly feedItemRepository: Repository<FeedItem>,
    @InjectRepository(Org)
    private readonly orgRepository: Repository<Org>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  @OnEvent('workItem.created')
  async handleWorkItemCreated(event: WorkItemDto) {
    const feedItem = new FeedItem();
    const org = await this.orgRepository.findOneByOrFail({ id: event.org.id });
    const user = await this.userRepository.findOneByOrFail({
      id: event.createdBy.id,
    });
    const product = await this.productsRepository.findOneByOrFail({
      id: event.product.id,
      org: { id: event.org.id },
    });
    feedItem.org = Promise.resolve(org);
    feedItem.user = Promise.resolve(user);
    feedItem.product = Promise.resolve(product);
    feedItem.title = 'Work Item Created';
    feedItem.entity = 'workItem';
    feedItem.entityId = event.id;
    feedItem.action = 'created';
    feedItem.content = event;
    await this.feedItemRepository.save(feedItem);
  }

  @OnEvent('workItem.deleted')
  async handleWorkItemDeleted(event: WorkItemDto) {
    const feedItem = new FeedItem();
    const org = await this.orgRepository.findOneByOrFail({ id: event.org.id });
    const user = await this.userRepository.findOneByOrFail({
      id: event.createdBy.id,
    });
    const product = await this.productsRepository.findOneByOrFail({
      id: event.product.id,
      org: { id: event.org.id },
    });
    feedItem.org = Promise.resolve(org);
    feedItem.user = Promise.resolve(user);
    feedItem.product = Promise.resolve(product);
    feedItem.title = 'Work Item Deleted';
    feedItem.entity = 'workItem';
    feedItem.entityId = event.id;
    feedItem.action = 'deleted';
    feedItem.content = event;
    await this.feedItemRepository.save(feedItem);
  }

  @OnEvent('workItem.updated')
  async handleWorkItemUpdated(event: {
    previous: WorkItemDto;
    current: WorkItemDto;
  }) {
    const feedItem = new FeedItem();
    const org = await this.orgRepository.findOneByOrFail({
      id: event.current.org.id,
    });
    const user = await this.userRepository.findOneByOrFail({
      id: event.current.createdBy.id,
    });
    const product = await this.productsRepository.findOneByOrFail({
      id: event.current.product.id,
      org: { id: event.current.org.id },
    });
    feedItem.org = Promise.resolve(org);
    feedItem.user = Promise.resolve(user);
    feedItem.product = Promise.resolve(product);
    feedItem.title = 'Work Item Updated';
    feedItem.entity = 'workItem';
    feedItem.entityId = event.current.id;
    feedItem.action = 'updated';
    feedItem.content = event;
    await this.feedItemRepository.save(feedItem);
  }

  @OnEvent('okr.created')
  async handleOKRCreated(event: OKRDto) {
    const feedItem = new FeedItem();
    const org = await this.orgRepository.findOneByOrFail({
      id: event.objective.org.id,
    });
    const product = await this.productsRepository.findOneByOrFail({
      id: event.objective.product.id,
      org: { id: event.objective.org.id },
    });
    feedItem.org = Promise.resolve(org);
    feedItem.product = Promise.resolve(product);
    feedItem.title = 'OKR Created';
    feedItem.entity = 'okr';
    feedItem.entityId = event.objective.id;
    feedItem.action = 'created';
    feedItem.content = event;
    await this.feedItemRepository.save(feedItem);
  }

  @OnEvent('okr.deleted')
  async handleOKRDeleted(event: OKRDto) {
    const feedItem = new FeedItem();
    const org = await this.orgRepository.findOneByOrFail({
      id: event.objective.org.id,
    });
    const product = await this.productsRepository.findOneByOrFail({
      id: event.objective.product.id,
      org: { id: event.objective.org.id },
    });
    feedItem.org = Promise.resolve(org);
    feedItem.product = Promise.resolve(product);
    feedItem.title = 'OKR Deleted';
    feedItem.entity = 'okr';
    feedItem.entityId = event.objective.id;
    feedItem.action = 'deleted';
    feedItem.content = event;
    await this.feedItemRepository.save(feedItem);
  }

  @OnEvent('okr.updated')
  async handleOKRUpdated(event: { previous: OKRDto; current: OKRDto }) {
    const feedItem = new FeedItem();
    const org = await this.orgRepository.findOneByOrFail({
      id: event.current.objective.org.id,
    });
    const product = await this.productsRepository.findOneByOrFail({
      id: event.current.objective.product.id,
      org: { id: event.current.objective.org.id },
    });
    feedItem.org = Promise.resolve(org);
    feedItem.product = Promise.resolve(product);
    feedItem.title = 'OKR Updated';
    feedItem.entity = 'okr';
    feedItem.entityId = event.current.objective.id;
    feedItem.action = 'updated';
    feedItem.content = event;
    await this.feedItemRepository.save(feedItem);
  }

  @OnEvent('keyResult.created')
  async handleKeyResultCreated(event: KeyResultDto) {
    const feedItem = new FeedItem();
    const org = await this.orgRepository.findOneByOrFail({
      id: event.org.id,
    });
    const product = await this.productsRepository.findOneByOrFail({
      id: event.product.id,
      org: { id: event.org.id },
    });
    feedItem.org = Promise.resolve(org);
    feedItem.product = Promise.resolve(product);
    feedItem.title = 'Key Result Created';
    feedItem.entity = 'keyResult';
    feedItem.entityId = event.id;
    feedItem.action = 'created';
    feedItem.content = event;
    await this.feedItemRepository.save(feedItem);
  }

  @OnEvent('keyResult.deleted')
  async handleKeyResultDeleted(event: KeyResultDto) {
    const feedItem = new FeedItem();
    const org = await this.orgRepository.findOneByOrFail({
      id: event.org.id,
    });
    const product = await this.productsRepository.findOneByOrFail({
      id: event.product.id,
      org: { id: event.org.id },
    });
    feedItem.org = Promise.resolve(org);
    feedItem.product = Promise.resolve(product);
    feedItem.title = 'Key Result Deleted';
    feedItem.entity = 'keyResult';
    feedItem.entityId = event.id;
    feedItem.action = 'deleted';
    feedItem.content = event;
    await this.feedItemRepository.save(feedItem);
  }

  @OnEvent('keyResult.updated')
  async handleKeyResultUpdated(event: {
    previous: KeyResultDto;
    current: KeyResultDto;
  }) {
    const feedItem = new FeedItem();
    const org = await this.orgRepository.findOneByOrFail({
      id: event.current.org.id,
    });
    const product = await this.productsRepository.findOneByOrFail({
      id: event.current.product.id,
      org: { id: event.current.org.id },
    });
    feedItem.org = Promise.resolve(org);
    feedItem.product = Promise.resolve(product);
    feedItem.title = 'Key Result Updated';
    feedItem.entity = 'keyResult';
    feedItem.entityId = event.current.id;
    feedItem.action = 'updated';
    feedItem.content = event;
    await this.feedItemRepository.save(feedItem);
  }

  @OnEvent('feature.created')
  async handleFeatureCreated(event: FeatureDto) {
    const feedItem = new FeedItem();
    const org = await this.orgRepository.findOneByOrFail({
      id: event.org.id,
    });
    const product = await this.productsRepository.findOneByOrFail({
      id: event.product.id,
      org: { id: event.org.id },
    });
    feedItem.org = Promise.resolve(org);
    feedItem.product = Promise.resolve(product);
    feedItem.title = 'Feature Created';
    feedItem.entity = 'feature';
    feedItem.entityId = event.id;
    feedItem.action = 'created';
    feedItem.content = event;
    await this.feedItemRepository.save(feedItem);
  }

  @OnEvent('feature.deleted')
  async handleFeatureDeleted(event: FeatureDto) {
    const feedItem = new FeedItem();
    const org = await this.orgRepository.findOneByOrFail({
      id: event.org.id,
    });
    const product = await this.productsRepository.findOneByOrFail({
      id: event.product.id,
      org: { id: event.org.id },
    });
    feedItem.org = Promise.resolve(org);
    feedItem.product = Promise.resolve(product);
    feedItem.title = 'Feature Deleted';
    feedItem.entity = 'feature';
    feedItem.entityId = event.id;
    feedItem.action = 'deleted';
    feedItem.content = event;
    await this.feedItemRepository.save(feedItem);
  }

  @OnEvent('feature.updated')
  async handleFeatureUpdated(event: {
    previous: FeatureDto;
    current: FeatureDto;
  }) {
    const feedItem = new FeedItem();
    const org = await this.orgRepository.findOneByOrFail({
      id: event.current.org.id,
    });
    const product = await this.productsRepository.findOneByOrFail({
      id: event.current.product.id,
      org: { id: event.current.org.id },
    });
    feedItem.org = Promise.resolve(org);
    feedItem.product = Promise.resolve(product);
    feedItem.title = 'Feature Updated';
    feedItem.entity = 'feature';
    feedItem.entityId = event.current.id;
    feedItem.action = 'updated';
    feedItem.content = event;
    await this.feedItemRepository.save(feedItem);
  }
}
