import { FeedController } from './feed.controller';
import { Org } from '../orgs/org.entity';
import { User } from '../users/user.entity';
import { setupTestingModule } from '../../test/test.utils';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { OrgsService } from '../orgs/orgs.service';
import { UsersService } from '../users/users.service';
import { FeedService } from './feed.service';
import { FeedEventHandler } from './feed.event-handler';
import { FeedItem } from './feed-item.entity';

describe('FeedController', () => {
  let controller: FeedController;
  let cleanup: () => Promise<void>;
  let org: Org;
  let user: User;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [TypeOrmModule.forFeature([Org, FeedItem]), UsersModule],
      [FeedService, FeedEventHandler],
      [FeedController],
    );
    cleanup = dbCleanup;
    controller = module.get<FeedController>(FeedController);
    const orgsService = module.get<OrgsService>(OrgsService);
    const usersService = module.get<UsersService>(UsersService);
    user = await usersService.createUserWithOrg(
      'Test User',
      'test@example.com',
      'testtesttest',
    );
    org = await orgsService.createForUser(user);
  });

  afterEach(async () => {
    await cleanup();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('when listing feed items', () => {
    it('should return the paginated list of feed items', async () => {
      const result = await controller.listFeedItems(
        {
          user: {
            org: org.id,
          },
        },
        1,
        10,
      );
      expect(result).toEqual([]);
    });
  });
});
