import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeedItem } from './feed-item.entity';
import { WorkItemDto } from '../backlog/work-items/dtos';
import { Org } from '../orgs/org.entity';
import { User } from '../users/user.entity';
import { OKRDto } from '../okrs/dtos';

@Injectable()
export class FeedEventHandler {
  constructor(
    @InjectRepository(FeedItem)
    private readonly feedItemRepository: Repository<FeedItem>,
    @InjectRepository(Org)
    private readonly orgRepository: Repository<Org>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  @OnEvent('workItem.created')
  async handleWorkItemCreated(event: WorkItemDto) {
    const feedItem = new FeedItem();
    const org = await this.orgRepository.findOneByOrFail({ id: event.org.id });
    const user = await this.userRepository.findOneByOrFail({
      id: event.createdBy.id,
    });
    feedItem.org = Promise.resolve(org);
    feedItem.user = Promise.resolve(user);
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
    feedItem.org = Promise.resolve(org);
    feedItem.user = Promise.resolve(user);
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
    feedItem.org = Promise.resolve(org);
    feedItem.user = Promise.resolve(user);
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
    feedItem.org = Promise.resolve(org);
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
    feedItem.org = Promise.resolve(org);
    feedItem.title = 'OKR Deleted';
    feedItem.entity = 'okr';
    feedItem.entityId = event.objective.id;
    feedItem.action = 'deleted';
    feedItem.content = event;
    await this.feedItemRepository.save(feedItem);
  }
}
