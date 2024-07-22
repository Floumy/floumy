import { FeedService } from './feed.service';
import { setupTestingModule } from '../../test/test.utils';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { FeedItem } from './feed-item.entity';
import { Org } from '../orgs/org.entity';
import { User } from '../users/user.entity';
import { FeedEventHandler } from './feed.event-handler';
import { UsersService } from '../users/users.service';
import { OrgsService } from '../orgs/orgs.service';
import { Repository } from 'typeorm';

describe('FeedService', () => {
  let service: FeedService;
  let feedItemRepository: Repository<FeedItem>;
  let user: User;
  let org: Org;
  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [TypeOrmModule.forFeature([FeedItem, Org, User])],
      [FeedEventHandler, FeedService, UsersService, OrgsService],
    );
    service = module.get<FeedService>(FeedService);
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
    expect(service).toBeDefined();
  });

  describe('when listing feed items', () => {
    it('should return the paginated list of feed items', async () => {
      const feedItem = new FeedItem();
      feedItem.org = Promise.resolve(org);
      feedItem.user = Promise.resolve(user);
      feedItem.title = 'Test Feed Item';
      feedItem.entity = 'workItem';
      feedItem.entityId = '1';
      feedItem.action = 'created';
      feedItem.content = { id: '1' };
      await feedItemRepository.save(feedItem);

      const result = await service.listFeedItems(org.id, 1, 10);

      expect(result).toHaveLength(1);
      expect(result[0].title).toEqual('Test Feed Item');
      expect(result[0].entity).toEqual('workItem');
      expect(result[0].entityId).toEqual('1');
      expect(result[0].action).toEqual('created');
      expect(result[0].content).toEqual({ id: '1' });
    });
  });

  describe('when creating a text feed item', () => {
    it('should create a feed item', async () => {
      const result = await service.createTextFeedItem(user.id, org.id, {
        text: 'Test Text Feed Item',
      });
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.title).toEqual('Text Feed Item Created');
      expect(result.entity).toEqual('text');
      expect(result.entityId).toEqual(null);
      expect(result.action).toEqual('created');
      expect(result.content).toEqual({ text: 'Test Text Feed Item' });
    });
    it('should throw an error if the user is not part of the org', async () => {
      await expect(
        service.createTextFeedItem('invalid-id', org.id, {
          text: 'Test Text Feed Item',
        }),
      ).rejects.toThrow();
    });
    it('should throw an error if the item does not have a text field', async () => {
      await expect(
        service.createTextFeedItem(user.id, org.id, {
          tex: 'Test Text Feed Item',
        } as any),
      ).rejects.toThrow();
    });
  });
});
