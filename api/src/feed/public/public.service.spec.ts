import { PublicService } from './public.service';
import { FeedService } from '../feed.service';
import { Repository } from 'typeorm';
import { FeedItem } from '../feed-item.entity';
import { User } from '../../users/user.entity';
import { Org } from '../../orgs/org.entity';
import { setupTestingModule } from '../../../test/test.utils';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { FeedEventHandler } from '../feed.event-handler';
import { UsersService } from '../../users/users.service';
import { OrgsService } from '../../orgs/orgs.service';
import { BipSettings } from '../../bip/bip-settings.entity';
import { Project } from '../../projects/project.entity';

describe('PublicService', () => {
  let service: PublicService;
  let feedItemRepository: Repository<FeedItem>;
  let user: User;
  let org: Org;
  let project: Project;
  let cleanup: () => Promise<void>;
  let bipRepository: Repository<BipSettings>;
  let orgsRepository: Repository<Org>;
  let usersService: UsersService;
  let projectRepository: Repository<Project>;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [TypeOrmModule.forFeature([FeedItem, Org, User])],
      [FeedEventHandler, FeedService, UsersService, OrgsService, PublicService],
    );
    service = module.get<PublicService>(PublicService);
    feedItemRepository = module.get<Repository<FeedItem>>(
      getRepositoryToken(FeedItem),
    );
    bipRepository = module.get<Repository<BipSettings>>(
      getRepositoryToken(BipSettings),
    );
    orgsRepository = module.get<Repository<Org>>(getRepositoryToken(Org));
    projectRepository = module.get<Repository<Project>>(
      getRepositoryToken(Project),
    );
    const orgsService = module.get<OrgsService>(OrgsService);
    usersService = module.get<UsersService>(UsersService);
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
      feedItem.project = Promise.resolve(project);
      feedItem.title = 'Test Feed Item';
      feedItem.entity = 'workItem';
      feedItem.entityId = '1';
      feedItem.action = 'created';
      feedItem.content = { id: '1' };
      await feedItemRepository.save(feedItem);

      const result = await service.listFeedItems(org.id, project.id, 1, 10);
      expect(result).toHaveLength(1);
    });
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

      const result = await service.listFeedItems(org.id, project.id, 1, 10);
      expect(result).toHaveLength(1);
    });
    it('should throw an error if the isFeedPagePublic is false', async () => {
      const newOrg = await orgsRepository.save(new Org());
      const newProject = new Project();
      newProject.name = 'Test Project';
      newProject.org = Promise.resolve(newOrg);
      await projectRepository.save(newProject);
      const bipSettings = new BipSettings();
      bipSettings.isBuildInPublicEnabled = true;
      bipSettings.isFeedPagePublic = false;
      bipSettings.org = Promise.resolve(newOrg);
      bipSettings.project = Promise.resolve(newProject);
      await bipRepository.save(bipSettings);
      await expect(
        service.listFeedItems(newOrg.id, newProject.id, 1, 10),
      ).rejects.toThrow();
    });
    it('should filter out assignedTo from the feed items', async () => {
      const feedItem = new FeedItem();
      feedItem.org = Promise.resolve(org);
      feedItem.user = Promise.resolve(user);
      feedItem.project = Promise.resolve(project);
      feedItem.title = 'Test Feed Item';
      feedItem.entity = 'workItem';
      feedItem.entityId = '1';
      feedItem.action = 'created';
      feedItem.content = { id: '1', assignedTo: { id: '2' } };

      await feedItemRepository.save(feedItem);

      const result = await service.listFeedItems(org.id, project.id, 1, 10);

      expect(result).toHaveLength(1);
      expect(result[0].title).toEqual('Test Feed Item');
      expect(result[0].entity).toEqual('workItem');
      expect(result[0].entityId).toEqual('1');
      expect(result[0].action).toEqual('created');
      expect(result[0].content).toEqual({ id: '1' });
      expect(result[0].content.assignedTo).toBeUndefined();
    });
  });
});
