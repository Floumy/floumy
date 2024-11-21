import { PublicController } from './public.controller';
import { Org } from '../../orgs/org.entity';
import { User } from '../../users/user.entity';
import { setupTestingModule } from '../../../test/test.utils';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { FeedItem } from '../feed-item.entity';
import { UsersModule } from '../../users/users.module';
import { FeedService } from '../feed.service';
import { FeedEventHandler } from '../feed.event-handler';
import { OrgsService } from '../../orgs/orgs.service';
import { UsersService } from '../../users/users.service';
import { PublicService } from './public.service';
import { Repository } from 'typeorm';
import { BipSettings } from '../../bip/bip-settings.entity';
import { Project } from '../../projects/project.entity';

describe('PublicController', () => {
  let controller: PublicController;
  let cleanup: () => Promise<void>;
  let org: Org;
  let user: User;
  let project: Project;
  let feedItemRepository: Repository<FeedItem>;
  let bipRepository: Repository<BipSettings>;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [TypeOrmModule.forFeature([Org, FeedItem]), UsersModule],
      [FeedService, FeedEventHandler, PublicService],
      [PublicController],
    );
    cleanup = dbCleanup;
    controller = module.get<PublicController>(PublicController);
    feedItemRepository = module.get<Repository<FeedItem>>(
      getRepositoryToken(FeedItem),
    );
    bipRepository = module.get<Repository<BipSettings>>(
      getRepositoryToken(BipSettings),
    );
    const orgsService = module.get<OrgsService>(OrgsService);
    const usersService = module.get<UsersService>(UsersService);
    user = await usersService.createUserWithOrg(
      'Test User',
      'test@example.com',
      'testtesttest',
    );
    org = await orgsService.createForUser(user);
    project = (await org.projects)[0];
    const bipSettings = new BipSettings();
    bipSettings.isBuildInPublicEnabled = true;
    bipSettings.isFeedPagePublic = true;
    bipSettings.org = Promise.resolve(org);
    bipSettings.project = Promise.resolve(project);
    await bipRepository.save(bipSettings);
  });

  afterEach(async () => {
    await cleanup();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('when listing feed items', () => {
    it('should return the paginated list of feed items', async () => {
      const feedItem = new FeedItem();
      feedItem.org = Promise.resolve(org);
      feedItem.user = Promise.resolve(user);
      feedItem.project = Promise.resolve(project);
      feedItem.title = 'Test Feed Item';
      feedItem.entity = 'workItem';
      feedItem.entityId = '1';
      feedItem.action = 'created';
      feedItem.content = { id: '1' };
      await feedItemRepository.save(feedItem);

      const result = await controller.listFeedItems(org.id, project.id, 1, 10);
      expect(result).toHaveLength(1);
    });
  });
});
