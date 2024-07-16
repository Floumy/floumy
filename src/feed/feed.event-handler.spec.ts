import { FeedEventHandler } from './feed.event-handler';
import { setupTestingModule } from '../../test/test.utils';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Org } from '../orgs/org.entity';
import { User } from '../users/user.entity';
import { FeedItem } from './feed-item.entity';
import { FeedService } from './feed.service';
import { Repository } from 'typeorm';
import { OrgsService } from '../orgs/orgs.service';
import { UsersService } from '../users/users.service';
import { v4 as uuid } from 'uuid';

describe('FeedEventHandler', () => {
  let cleanup: () => Promise<void>;
  let handler: FeedEventHandler;
  let feedItemRepository: Repository<FeedItem>;
  let org: Org;
  let user: User;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [TypeOrmModule.forFeature([FeedItem, Org, User])],
      [FeedEventHandler, FeedService, UsersService, OrgsService],
    );
    handler = module.get<FeedEventHandler>(FeedEventHandler);
    feedItemRepository = module.get<Repository<FeedItem>>(
      getRepositoryToken(FeedItem),
    );
    const orgsService = module.get<OrgsService>(OrgsService);
    const usersService = module.get<UsersService>(UsersService);
    user = await usersService.createUserWithOrg(
      'Test User',
      'test@example.com',
      'testtesttest',
    );
    org = await orgsService.createForUser(user);
    cleanup = dbCleanup;
  });

  afterEach(async () => {
    await cleanup();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('handleWorkItemCreated', () => {
    it('should create a feed item when a work item is created', async () => {
      const event = {
        org: { id: org.id },
        createdBy: { id: user.id },
        id: uuid(),
      } as any;

      await handler.handleWorkItemCreated(event);

      const feedItem = await feedItemRepository.findOne({
        where: { entityId: event.id },
      });
      expect(feedItem).toBeDefined();
      expect(feedItem.title).toBe('Work Item Created');
      expect(feedItem.entity).toBe('workItem');
      expect(feedItem.entityId).toBe(event.id);
      expect(feedItem.action).toBe('created');
      expect(feedItem.content).toEqual(event);
    });
  });

  describe('handleWorkItemUpdated', () => {
    it('should create a feed item when a work item is updated', async () => {
      const event = {
        previous: {
          org: { id: org.id },
          createdBy: { id: user.id },
          id: uuid(),
        },
        current: {
          org: { id: org.id },
          createdBy: { id: user.id },
          id: uuid(),
        },
      } as any;

      await handler.handleWorkItemUpdated(event);

      const feedItem = await feedItemRepository.findOne({
        where: { entityId: event.id },
      });
      expect(feedItem).toBeDefined();
      expect(feedItem.title).toBe('Work Item Updated');
      expect(feedItem.entity).toBe('workItem');
      expect(feedItem.entityId).toBe(event.current.id);
      expect(feedItem.action).toBe('updated');
      expect(feedItem.content).toEqual(event);
    });
  });

  describe('handleWorkItemDeleted', () => {
    it('should create a feed item when a work item is deleted', async () => {
      const event = {
        org: { id: org.id },
        createdBy: { id: user.id },
        id: uuid(),
      } as any;

      await handler.handleWorkItemDeleted(event);

      const feedItem = await feedItemRepository.findOne({
        where: { entityId: event.id },
      });
      expect(feedItem).toBeDefined();
      expect(feedItem.title).toBe('Work Item Deleted');
      expect(feedItem.entity).toBe('workItem');
      expect(feedItem.entityId).toBe(event.id);
      expect(feedItem.action).toBe('deleted');
      expect(feedItem.content).toEqual(event);
    });
  });

  describe('handleOKRCreated', () => {
    it('should create a feed item when an OKR is created', async () => {
      const event = {
        objective: {
          id: uuid(),
          org: { id: org.id },
        },
      } as any;

      await handler.handleOKRCreated(event);

      const feedItem = await feedItemRepository.findOne({
        where: { entityId: event.id },
      });
      expect(feedItem).toBeDefined();
      expect(feedItem.title).toBe('OKR Created');
      expect(feedItem.entity).toBe('okr');
      expect(feedItem.entityId).toBe(event.objective.id);
      expect(feedItem.action).toBe('created');
      expect(feedItem.content).toEqual(event);
    });
  });

  describe('handleOKRDeleted', () => {
    it('should create a feed item when an OKR is deleted', async () => {
      const event = {
        objective: {
          id: uuid(),
          org: { id: org.id },
        },
      } as any;

      await handler.handleOKRDeleted(event);

      const feedItem = await feedItemRepository.findOne({
        where: { entityId: event.id },
      });
      expect(feedItem).toBeDefined();
      expect(feedItem.title).toBe('OKR Deleted');
      expect(feedItem.entity).toBe('okr');
      expect(feedItem.entityId).toBe(event.objective.id);
      expect(feedItem.action).toBe('deleted');
      expect(feedItem.content).toEqual(event);
    });
  });
});
