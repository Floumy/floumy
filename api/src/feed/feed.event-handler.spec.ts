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
import { Product } from '../products/product.entity';

describe('FeedEventHandler', () => {
  let cleanup: () => Promise<void>;
  let handler: FeedEventHandler;
  let feedItemRepository: Repository<FeedItem>;
  let org: Org;
  let user: User;
  let product: Product;

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
    product = (await org.products)[0];
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
        product: { id: product.id },
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
          product: { id: product.id },
          org: { id: org.id },
          createdBy: { id: user.id },
          id: uuid(),
        },
        current: {
          product: { id: product.id },
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
        product: { id: product.id },
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
          product: { id: product.id },
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
          product: { id: product.id },
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

  describe('handleOKRUpdated', () => {
    it('should create a feed item when an OKR is updated', async () => {
      const event = {
        previous: {
          objective: {
            id: uuid(),
            org: { id: org.id },
            product: { id: product.id },
          },
        },
        current: {
          objective: {
            id: uuid(),
            org: { id: org.id },
            product: { id: product.id },
          },
        },
      } as any;

      await handler.handleOKRUpdated(event);

      const feedItem = await feedItemRepository.findOne({
        where: { entityId: event.id },
      });
      expect(feedItem).toBeDefined();
      expect(feedItem.title).toBe('OKR Updated');
      expect(feedItem.entity).toBe('okr');
      expect(feedItem.entityId).toBe(event.current.objective.id);
      expect(feedItem.action).toBe('updated');
      expect(feedItem.content).toEqual(event);
    });
  });

  describe('handleKeyResultCreated', () => {
    it('should create a feed item when a key result is created', async () => {
      const event = {
        product: { id: product.id },
        org: { id: org.id },
        id: uuid(),
      } as any;

      await handler.handleKeyResultCreated(event);

      const feedItem = await feedItemRepository.findOne({
        where: { entityId: event.id },
      });
      expect(feedItem).toBeDefined();
      expect(feedItem.title).toBe('Key Result Created');
      expect(feedItem.entity).toBe('keyResult');
      expect(feedItem.entityId).toBe(event.id);
      expect(feedItem.action).toBe('created');
      expect(feedItem.content).toEqual(event);
    });
  });

  describe('handleKeyResultUpdated', () => {
    it('should create a feed item when a key result is updated', async () => {
      const event = {
        previous: {
          org: { id: org.id },
          product: { id: product.id },
          id: uuid(),
        },
        current: {
          org: { id: org.id },
          product: { id: product.id },
          id: uuid(),
        },
      } as any;

      await handler.handleKeyResultUpdated(event);

      const feedItem = await feedItemRepository.findOne({
        where: { entityId: event.id },
      });
      expect(feedItem).toBeDefined();
      expect(feedItem.title).toBe('Key Result Updated');
      expect(feedItem.entity).toBe('keyResult');
      expect(feedItem.entityId).toBe(event.current.id);
      expect(feedItem.action).toBe('updated');
      expect(feedItem.content).toEqual(event);
    });
  });

  describe('handleKeyResultDeleted', () => {
    it('should create a feed item when a key result is deleted', async () => {
      const event = {
        product: { id: product.id },
        org: { id: org.id },
        id: uuid(),
      } as any;

      await handler.handleKeyResultDeleted(event);

      const feedItem = await feedItemRepository.findOne({
        where: { entityId: event.id },
      });
      expect(feedItem).toBeDefined();
      expect(feedItem.title).toBe('Key Result Deleted');
      expect(feedItem.entity).toBe('keyResult');
      expect(feedItem.entityId).toBe(event.id);
      expect(feedItem.action).toBe('deleted');
      expect(feedItem.content).toEqual(event);
    });
  });

  describe('handleFeatureCreated', () => {
    it('should create a feed item when a feature is created', async () => {
      const event = {
        product: { id: product.id },
        org: { id: org.id },
        id: uuid(),
      } as any;

      await handler.handleFeatureCreated(event);

      const feedItem = await feedItemRepository.findOne({
        where: { entityId: event.id },
      });
      expect(feedItem).toBeDefined();
      expect(feedItem.title).toBe('Feature Created');
      expect(feedItem.entity).toBe('feature');
      expect(feedItem.entityId).toBe(event.id);
      expect(feedItem.action).toBe('created');
      expect(feedItem.content).toEqual(event);
    });
  });

  describe('handleFeatureUpdated', () => {
    it('should create a feed item when a feature is updated', async () => {
      const event = {
        previous: {
          org: { id: org.id },
          product: { id: product.id },
          id: uuid(),
        },
        current: {
          org: { id: org.id },
          product: { id: product.id },
          id: uuid(),
        },
      } as any;

      await handler.handleFeatureUpdated(event);

      const feedItem = await feedItemRepository.findOne({
        where: { entityId: event.id },
      });
      expect(feedItem).toBeDefined();
      expect(feedItem.title).toBe('Feature Updated');
      expect(feedItem.entity).toBe('feature');
      expect(feedItem.entityId).toBe(event.current.id);
      expect(feedItem.action).toBe('updated');
      expect(feedItem.content).toEqual(event);
    });
  });
  describe('handleFeatureDeleted', () => {
    it('should create a feed item when a feature is deleted', async () => {
      const event = {
        product: { id: product.id },
        org: { id: org.id },
        id: uuid(),
      } as any;

      await handler.handleFeatureDeleted(event);

      const feedItem = await feedItemRepository.findOne({
        where: { entityId: event.id },
      });
      expect(feedItem).toBeDefined();
      expect(feedItem.title).toBe('Feature Deleted');
      expect(feedItem.entity).toBe('feature');
      expect(feedItem.entityId).toBe(event.id);
      expect(feedItem.action).toBe('deleted');
      expect(feedItem.content).toEqual(event);
    });
  });
});
